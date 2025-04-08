# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import logging
from datetime import datetime, timezone, timedelta

import pytz
from celery import Celery
from celery.exceptions import SoftTimeLimitExceeded
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from sqlalchemy import func

from superset import app, is_feature_enabled
from superset.commands.exceptions import CommandException
from superset.commands.report.exceptions import ReportScheduleUnexpectedError
from superset.commands.report.execute import AsyncExecuteReportScheduleCommand
from superset.commands.report.log_prune import AsyncPruneReportScheduleLogCommand
from superset.commands.sql_lab.query import QueryPruneCommand
from superset.daos.report import ReportScheduleDAO
from superset.extensions import celery_app, db
from superset.models.dashboard import Dashboard, DashboardConfig, DashboardAccessLogs
from superset.stats_logger import BaseStatsLogger
from superset.tasks.cron_util import cron_schedule_window
from superset.tasks.refresh_dashboard_job import RefreshDashboardJob
from superset.utils.core import LoggerLevel
from superset.utils.log import get_logger_from_status

logger = logging.getLogger(__name__)


@celery_app.task(name="reports.scheduler")
def scheduler() -> None:
    """
    Celery beat main scheduler for reports
    """
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("reports.scheduler")

    if not is_feature_enabled("ALERT_REPORTS"):
        return
    active_schedules = ReportScheduleDAO.find_active()
    triggered_at = (
        datetime.fromisoformat(scheduler.request.expires)
        - app.config["CELERY_BEAT_SCHEDULER_EXPIRES"]
        if scheduler.request.expires
        else datetime.now(tz=timezone.utc)
    )
    for active_schedule in active_schedules:
        for schedule in cron_schedule_window(
            triggered_at, active_schedule.crontab, active_schedule.timezone
        ):
            logger.info("Scheduling alert %s eta: %s", active_schedule.name, schedule)
            async_options = {"eta": schedule}
            if (
                active_schedule.working_timeout is not None
                and app.config["ALERT_REPORTS_WORKING_TIME_OUT_KILL"]
            ):
                async_options["time_limit"] = (
                    active_schedule.working_timeout
                    + app.config["ALERT_REPORTS_WORKING_TIME_OUT_LAG"]
                )
                async_options["soft_time_limit"] = (
                    active_schedule.working_timeout
                    + app.config["ALERT_REPORTS_WORKING_SOFT_TIME_OUT_LAG"]
                )
            execute.apply_async((active_schedule.id,), **async_options)


@celery_app.task(name="reports.execute", bind=True)
def execute(self: Celery.task, report_schedule_id: int) -> None:
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("reports.execute")

    task_id = None
    try:
        task_id = execute.request.id
        scheduled_dttm = execute.request.eta
        logger.info(
            "Executing alert/report, task id: %s, scheduled_dttm: %s",
            task_id,
            scheduled_dttm,
        )
        AsyncExecuteReportScheduleCommand(
            task_id,
            report_schedule_id,
            scheduled_dttm,
        ).run()
    except ReportScheduleUnexpectedError:
        logger.exception(
            "An unexpected error occurred while executing the report: %s", task_id
        )
        self.update_state(state="FAILURE")
    except CommandException as ex:
        logger_func, level = get_logger_from_status(ex.status)
        logger_func(
            f"A downstream {level} occurred "
            f"while generating a report: {task_id}. {ex.message}",
            exc_info=True,
        )
        if level == LoggerLevel.EXCEPTION:
            self.update_state(state="FAILURE")


@celery_app.task(name="reports.prune_log")
def prune_log() -> None:
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("reports.prune_log")

    try:
        AsyncPruneReportScheduleLogCommand().run()
    except SoftTimeLimitExceeded as ex:
        logger.warning("A timeout occurred while pruning report schedule logs: %s", ex)
    except CommandException:
        logger.exception("An exception occurred while pruning report schedule logs")


@celery_app.task(name="prune_query")
def prune_query() -> None:
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("prune_query")

    try:
        QueryPruneCommand(
            prune_query.request.properties.get("retention_period_days")
        ).run()
    except CommandException as ex:
        logger.exception("An error occurred while pruning queries: %s", ex)


@celery_app.task(name="dashboard.set_default_schedule_refresh")
def set_default_schedule_refresh() -> None:
    """
    Celery beat main scheduler for dashboards
    Begin time: 04:00
    Every dashboard has a default refresh time
    one minute must have less than 5 dashboards
    """
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("dashboard.set_default_schedule_refresh")

    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    # if not is_feature_enabled("DASHBOARD_SCHEDULED_REFRESH"):
    #     return
    result = (db.session.query(
        DashboardAccessLogs.dashboard_id,
        func.count(DashboardAccessLogs.dashboard_id).label('access_count'))
              .filter(DashboardAccessLogs.time > seven_days_ago)
              .group_by(DashboardAccessLogs.dashboard_id)
              .order_by(func.count(DashboardAccessLogs.dashboard_id).desc())
              .all())

    other_dashboards = db.session.query(Dashboard).filter(
        Dashboard.id.notin_([dashboard_id for dashboard_id, _ in result])).all()


    dashboard_rank = [dashboard_id for dashboard_id, _ in result] + [dashboard.id for dashboard in other_dashboards]

    begin_time = datetime.now().replace(hour=4, minute=0, second=0, microsecond=0)

    for config in db.session.query(DashboardConfig).all():
        db.session.delete(config)

    for dashboard_id in dashboard_rank:
        db.session.add(DashboardConfig(
            dashboard_id=dashboard_id,
            cache_time=begin_time.strftime("%H:%M")
        ))
        begin_time += timedelta(seconds=30)

    db.session.commit()
    db.session.close()


@celery_app.task(name="dashboard.schedule_refresh")
def schedule_refresh() -> None:
    """
    Celery beat main scheduler for dashboards
    """
    stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
    stats_logger.incr("dashboard.schedule_refresh")

    # if not is_feature_enabled("DASHBOARD_SCHEDULED_REFRESH"):
    #     return
    dashboard_configs = db.session.query(DashboardConfig).all()

    now = (datetime.now(pytz.utc)
           .astimezone(pytz.timezone('Asia/Shanghai'))
           .strftime("%H:%M"))

    for config in dashboard_configs:
        if config.cache_time is not None and config.cache_time == now:
            dashboard_id = config.dashboard_id
            logger.info(
                "Scheduling dashboard %s refresh", dashboard_id
            )
            refresh_dashboard.delay(dashboard_id)
            # refresh_dashboard_v2.delay(dashboard_id)

@celery_app.task(name="dashboard.refresh", bind=True)
def refresh_dashboard(self, dashboard_id: int):

    # 初始化webdriver
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Remote(
        command_executor='http://chromedriver:4444/wd/hub',
        options=options
    )

    try:
        # base_url =
        base_url = "http://superset:8088"

        stats_logger: BaseStatsLogger = app.config["STATS_LOGGER"]
        stats_logger.incr("dashboard.refresh")

        # 初始化webdriver
        # 打开登录页面
        driver.get(base_url + '/login')

        # 添加等待登录页面元素加载完毕的逻辑
        username_input = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.NAME, 'username'))
        )
        password_input = driver.find_element(By.NAME, 'password')

        # 填写登录信息
        username_input.send_keys('superset')
        password_input.send_keys('admin')

        # 提交登录表单
        login_button = driver.find_element(By.CSS_SELECTOR, "input[type='submit']")
        login_button.click()

        # 等待登录成功并跳转完成
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'dashboard-sider-menus'))
        )
        # 访问受保护页面
        driver.get(base_url + '/superset/dashboard/' + str(dashboard_id))

        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, 'div[data-test-id="' + str(dashboard_id) + '"]'))
        )
    finally:
        if driver is not None:
            # 关闭浏览器
            driver.quit()

@celery_app.task(name="dashboard.refresh.v2", bind=True)
def refresh_dashboard_v2(self, dashboard_id: int) -> None:
    dashboard = db.session.query(Dashboard).filter_by(id=dashboard_id).first()
    if dashboard is None:
        return
    RefreshDashboardJob(user_id=dashboard.created_by_fk, dashboard=dashboard).run()

