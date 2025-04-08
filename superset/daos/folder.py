from __future__ import annotations

import logging
from typing import Any, Dict, List

from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.sqla.models import User

from superset import db, is_feature_enabled
from superset.daos.base import BaseDAO
from superset.dashboards.filters import DashboardAccessFilter
from superset.folder.models import Folder, FolderDashboardCorrelation, \
    ab_user_folder_table
from superset.models.dashboard import Dashboard
from superset.projects.models import ProjectCorrelationObject, ProjectCorrelationType
from superset.utils.core import get_user_id

logger = logging.getLogger()

class FolderDAO(BaseDAO[Folder]):
    model_cls = Folder
    base_filter = None

    @staticmethod
    def get_dashboards(project_id: int | None = None) -> dict[str, List[Dict[str, Any]]]:
        def dashboard_sort_order(dashboard: Dashboard) -> int:
            fdc = (db.session.query(FolderDashboardCorrelation)
                   .filter(FolderDashboardCorrelation.dashboard_id == dashboard.id)
                   .one_or_none())
            return -1 if fdc is None else fdc.sort_order

        def serialize_folder(folder: Folder | None) -> dict[str, Any] | None:
            if folder is None:
                return None

            return {
                'id': folder.id,
                'name': folder.name,
                'sort_order': folder.sort_order,
                'parent_folder_id': folder.parent_folder_id,
                'parent': serialize_folder(folder.parent),
                'users': [{
                    'id': user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                } for user in folder.users],
            }

        def serialize_dashboard(dashboard: Dashboard):
            return {
                'id': dashboard.id,
                'status': dashboard.status,
                'published': dashboard.published,
                'slug': dashboard.slug,
                'url': dashboard.url,
                'dashboard_title': dashboard.dashboard_title,
                'folder': serialize_folder(dashboard.folder),
                'sort_order': dashboard_sort_order(dashboard),
            }

        if is_feature_enabled("USE_PROJECT") is False or project_id is None:
            logger.info(f"Getting dashboards for project_id: {project_id} and USE_PROJECT is False")
            query = db.session.query(Dashboard)
        else:
            logger.info(f"Getting dashboards for project_id: {project_id}")
            query = (
                db.session.query(Dashboard)
                .join(ProjectCorrelationObject)
                .filter(ProjectCorrelationObject.object_id == Dashboard.id)
                .filter(
                    ProjectCorrelationObject.object_type == ProjectCorrelationType.DASHBOARD)
                .filter(ProjectCorrelationObject.project_id == project_id)
            )

        access_filter = DashboardAccessFilter("id", SQLAInterface(Dashboard))
        dashboards = access_filter.apply(query, value=None).all()

        folders = (
            db.session.query(Folder).select_from(Folder).join(
                ProjectCorrelationObject,
                ProjectCorrelationObject.object_id == Folder.id
            ).filter(
                ProjectCorrelationObject.project_id == project_id,
                ProjectCorrelationObject.object_type == ProjectCorrelationType.FOLDER
            ).all()
        )

        dashboard_result = [serialize_dashboard(dashboard) for dashboard in dashboards]
        folder_result = [serialize_folder(folder) for folder in folders]
        return {"dashboards": dashboard_result, "folders": folder_result}


    @classmethod
    def set_manager(slf, id: int, uids: str):
        folder = slf.find_by_id(id)
        folder.users = []
        users = db.session.query(User).filter(User.id.in_(uids.split(","))).all()
        folder.users.extend(users)
        db.session.commit()
        return folder
