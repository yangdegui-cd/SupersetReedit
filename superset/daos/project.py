from __future__ import annotations

from typing import List, Dict, Any

from flask_appbuilder.security.sqla.models import User
from sqlalchemy import func

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

    # @staticmethod
    # def get_list_by_user(user: User) -> List[Dict[str, Any]]:
    #     """
    #     @rtype: List[str]
    #     """
    #     session = db.session
    #     try:
    #         return (session.query(Project)
    #                 .join(UserProject, Project.id == UserProject.project_id)
    #                 .filter(UserProject.user_id == user.id)
    #                 .all())
    #     finally:
    #         session.close()

    @staticmethod
    def get_all_list() -> List[int]:
        project_ids = db.session.query(Project.project_id).all()
        return [row[0] for row in project_ids]

    # @staticmethod
    # def is_manager(user: User, project_id: int) -> bool:
    #     count = (db.session.query(func.count())
    #              .filter(UserProject.user_id == user.id,
    #                      UserProject.project_id == project_id)
    #              .scalar())
    #     return count != 0

    # @staticmethod
    # def validate_uniqueness(project_name: str) -> bool:
    #     project_query = db.session.query(Project).filter(
    #         Project.project_name == project_name
    #     )
    #     return not db.session.query(project_query.exists()).scalar()

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


# class UserProjectDAO(BaseDAO[UserProject]):
#
#     @staticmethod
#     def get_managers_by_project(project_id):
#         return (db.session.query(User)
#                 .join(UserProject, User.id == UserProject.user_id)
#                 .filter(UserProject.project_id == project_id)
#                 .all())
#
#     @classmethod
#     def get_projects_by_manager(cls, user_id):
#         return (db.session.query(UserProject.project_id)
#                 .filter(UserProject.user_id == user_id)
#                 .all())
