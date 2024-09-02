from typing import Any, List, Dict

from superset import db
from superset.commands.base import BaseCommand
from superset.daos.project import ProjectDAO
from superset.daos.project_correlation import ProjectCorrelationDAO
from superset.projects.models import ProjectCorrelationType, ProjectCorrelationObject


def add_manager_project(project_id: int, manager_ids: List[int]) -> None:
    for manager_id in manager_ids:
        ProjectCorrelationDAO.create_correlation(
            project_id,
            manager_id,
            ProjectCorrelationType.USER
        )


def dumped_manager_project(project_id: int, manager_ids: List[int]) -> None:
    (db.session.query(ProjectCorrelationObject)
     .filter(
        ProjectCorrelationObject.project_id == project_id,
        ProjectCorrelationObject.object_id.in_(manager_ids),
        ProjectCorrelationObject.object_type == ProjectCorrelationType.USER,
    ).delete())


class SetManagersCommand(BaseCommand):

    def validate(self) -> None:
        # TODO document why this method is empty
        pass

    def __init__(self, data: Dict[str, Any]):
        self._properties = data.copy()

    def run(self, run_type='project') -> Any:
        if run_type == 'project':
            return self.run_by_project()
        elif run_type == 'manager':
            return self.run_by_manager()
        else:
            raise ValueError(f"Unknown type: {run_type}")

    def run_by_project(self) -> Any:
        project_id = self._properties["project_id"]
        manager_ids = self._properties.get("manager_ids", [])
        try:
            (db.session.query(ProjectCorrelationObject)
             .filter(
                ProjectCorrelationObject.project_id == project_id,
                ProjectCorrelationObject.object_type == ProjectCorrelationType.USER
            ).delete())
            for manager_id in manager_ids:
                ProjectCorrelationDAO.create_correlation(
                    project_id,
                    manager_id,
                    ProjectCorrelationType.USER
                )
            db.session.commit()
        except Exception as ex:
            db.session.rollback()
            raise ex

        return ProjectDAO.find_by_id(project_id).users

    def run_by_manager(self) -> Any:
        manager_id = self._properties["manager_id"]
        project_ids = self._properties.get("project_ids", [])
        try:
            (db.session.query(ProjectCorrelationObject)
             .filter(
                ProjectCorrelationObject.object_id == manager_id,
                ProjectCorrelationObject.object_type == ProjectCorrelationType.USER
            ).delete())
            for project_id in project_ids:
                ProjectCorrelationDAO.create_correlation(
                    project_id,
                    manager_id,
                    ProjectCorrelationType.USER
                )
            db.session.commit()
        except Exception as ex:
            db.session.rollback()
            raise ex

        return ProjectCorrelationDAO.get_projects_by_user(manager_id)
