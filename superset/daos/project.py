from __future__ import annotations
from typing import List, Dict, Any
from flask_appbuilder.security.sqla.models import User
from superset import is_feature_enabled
from superset.daos.base import BaseDAO
from superset.extensions import db
from superset.projects.models import (
    Project,
    ProjectCorrelationObject,
    ProjectCorrelationType
)


class ProjectDAO(BaseDAO[Project]):

    @staticmethod
    def find_project_by_name(name: str) -> Project | None:
        return (
            db.session.query(Project)
            .filter(Project.project_name == name)
            .one_or_none()
        )

    @staticmethod
    def get_list_by_user(user: User) -> List[Dict[str, Any]]:
        """
        @rtype: List[str]
        """
        session = db.session
        try:
            return (
                session.query(Project)
                .join(ProjectCorrelationObject,
                      Project.id == ProjectCorrelationObject.project_id)
                .filter(ProjectCorrelationObject.object_id == user.id)
                .filter(
                    ProjectCorrelationObject.object_type == ProjectCorrelationType.USER)
                .all())
        finally:
            session.close()

    @staticmethod
    def get_all_list() -> List[int]:
        project_ids = db.session.query(Project.project_id).all()
        return [row[0] for row in project_ids]

    @staticmethod
    def create_correlation(project_id, object_id, object_type: ProjectCorrelationType):
        if is_feature_enabled("USE_PROJECT") is False or project_id is None or object_id is None or object_type is None:
            return None

        correlation = ProjectCorrelationObject(
            project_id=project_id,
            object_id=object_id,
            object_type=object_type,
        )
        db.session.add(correlation)
        db.session.commit()

    @classmethod
    def is_manager(cls, user, project_id):
        count = (db.session.query(ProjectCorrelationObject)
                 .filter(ProjectCorrelationObject.object_id == user.id,
                         ProjectCorrelationObject.project_id == project_id,
                         ProjectCorrelationObject.object_type == ProjectCorrelationType.USER)
                 .count())
        return count != 0
