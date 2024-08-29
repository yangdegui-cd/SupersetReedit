from typing import Any, Optional, Dict
from flask_appbuilder.security.sqla.models import Role, User
from marshmallow import ValidationError

from superset import db
from superset.commands.base import BaseCommand
from superset.daos.project import ProjectDAO
from superset.projects.models import ProjectCorrelationObject, ProjectCorrelationType


class CreateProjectCommand(BaseCommand):
    def __init__(self, data: Dict[str, Any]):
        self._properties = data.copy()

    def run(self) -> Any:
        self.validate()
        try:
            project = ProjectDAO.create(attributes=self._properties, commit=False)
            db.session.flush()
            admin_user_ids = (db.session.query(User.id)
                              .join(User.roles)  # 使用 join 来访问 roles 属性
                              .filter(Role.name == 'Admin')
                              .all())

            for (user_id,) in admin_user_ids:
                ProjectCorrelationObject.create(
                    attributes={
                        "project_id": project.id,
                        "object_id": user_id,
                        "object_type": ProjectCorrelationType.USER,
                    },
                    commit=False,
                )
            db.session.commit()
        except Exception as ex:
            db.session.rollback()
            raise ex

        return project

    def validate(self) -> None:
        exceptions: list[ValidationError] = []
        name: Optional[Any] = self._properties.get("name")
        project_name: Optional[Any] = self._properties.get("project_name")
        if not name:
            exceptions.append(ValidationError("Name is required"))
        if not project_name:
            exceptions.append(ValidationError("Project name is required"))
        if exceptions:
            exception = ValidationError("Invalid input")
            exception.messages = exceptions
            raise exception
