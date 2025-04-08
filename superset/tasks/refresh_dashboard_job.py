import json
import logging
from sre_constants import error
from typing import Any, Dict, Optional

from superset import security_manager
from superset.commands.chart.data.get_data_command import ChartDataCommand
from superset.common.chart_data import ChartDataResultFormat, ChartDataResultType
from superset.common.query_context_factory import QueryContextFactory
from superset.constants import EXTRA_FORM_DATA_OVERRIDE_REGULAR_MAPPINGS
from superset.models.dashboard import Dashboard
from superset.utils.core import override_user

logger = logging.getLogger(__name__)


class RefreshDashboardJob:
    def __init__(self, user_id, dashboard: Dashboard):
        self.user_id = user_id
        self.dashboard = dashboard

    def run(self):
        user = security_manager.get_user_by_id(self.user_id)
        with override_user(user):
            condition = self.get_dashboard_condition(self.dashboard)
            error_count = 0
            exception = None
            for _slice in self.dashboard.slices:
                try:
                    form_data = json.loads(_slice.query_context)
                    form_data["force"] = True
                    form_data["result_format"] = ChartDataResultFormat.JSON
                    form_data["result_type"] = ChartDataResultType.FULL
                    form_data = self.merge_form_data(form_data, condition)
                    self.get_data(form_data)
                except Exception as e:
                    error_count += 1
                    exception = e
                    logger.error("Error", exc_info=e)
            if error_count > 0:
                logger.error(f"Error count: {error_count}")
                raise exception

    def get_dashboard_condition(self, dashboard: Dashboard) -> Optional[Dict[Any, Any]]:

        json_metadata = json.loads(dashboard.json_metadata)
        res = {}
        try:
            for v in json_metadata['native_filter_configuration']:
                res.update(v['defaultDataMask']['extraFormData'])
            return res
        except Exception as e:
            logger.error("Error", exc_info=e)
            return None

    @staticmethod
    def merge_form_data(form_data: Dict[str, Any],
                        condition: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if condition is None: return form_data
        new_queries = []
        for query in form_data.get('queries', []):
            for src_key, target_key in EXTRA_FORM_DATA_OVERRIDE_REGULAR_MAPPINGS.items():
                value = condition.get(src_key)
                if value is not None:
                    query[target_key] = value

            filters = condition.get('filters', [])
            if filters and 'filters' in query:
                query.setdefault('filters', [])
                for _filter in filters:
                    query['filters'].insert(0, _filter)

            if 'custom_params' in query and not query['custom_params']:
                del query['custom_params']

            if 'custom_form_data' in query and not query['custom_form_data']:
                del query['custom_form_data']

            new_queries.append(query)

        form_data['queries'] = new_queries
        return form_data

    @staticmethod
    def get_data(form_data):
        query_context = QueryContextFactory().create(**form_data)
        command = ChartDataCommand(query_context)
        return command.run(force_cached=True, cache=True)
