from __future__ import annotations

from typing import Any, Dict, List

from flask_appbuilder.models.sqla.interface import SQLAInterface

from superset import db, is_feature_enabled
from superset.daos.base import BaseDAO
from superset.dashboards.filters import DashboardAccessFilter
from superset.folder.models import Folder, FolderDashboardCorrelation
from superset.models.dashboard import Dashboard
from superset.projects.models import ProjectCorrelationObject, ProjectCorrelationType
from superset.utils.core import DashboardStatus


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
            query = db.session.query(Dashboard)
        else:
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
        folders = db.session.query(Folder).all()
        dashboard_result = [serialize_dashboard(dashboard) for dashboard in dashboards]
        folder_result = [serialize_folder(folder) for folder in folders]
        return {"dashboards": dashboard_result, "folders": folder_result}
