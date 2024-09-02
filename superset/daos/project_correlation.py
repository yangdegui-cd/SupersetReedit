from superset import is_feature_enabled
from superset.daos.base import BaseDAO
from superset.extensions import db
from superset.projects.models import ProjectCorrelationObject, ProjectCorrelationType


class ProjectCorrelationDAO(BaseDAO[ProjectCorrelationObject]):

    @staticmethod
    def create_correlation(project_id, object_id, object_type):
        if is_feature_enabled("USE_PROJECT") is False or project_id is None or object_id is None or object_type is None:
            return None

        correlation = ProjectCorrelationObject(
            project_id=project_id,
            object_id=object_id,
            object_type=object_type,
        )
        db.session.add(correlation)
        return correlation

    @staticmethod
    def get_projects_by_user(user_id):
        return (
            db.session.query(ProjectCorrelationObject)
            .filter(ProjectCorrelationObject.object_id == user_id)
            .filter(ProjectCorrelationObject.object_type == ProjectCorrelationType.USER)
            .all()
        )
