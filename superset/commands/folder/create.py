from functools import partial
from typing import Any

from marshmallow import ValidationError

from superset import db, is_feature_enabled
from superset.commands.dataset.exceptions import FolderCreateFailedError
from superset.daos.folder import FolderDAO
from superset.daos.project_correlation import ProjectCorrelationDAO
from superset.folder.models import Folder
from superset.projects.models import ProjectCorrelationType
from superset.utils.decorators import transaction, on_error


class CreateFolderCommand:
    def __init__(self, data: dict[str, Any]):
        self._properties = data.copy()

    @transaction(on_error=partial(on_error, reraise=FolderCreateFailedError))
    def run(self) -> Folder:
        self.validate()

        folder = FolderDAO.create(attributes=self._properties)
        db.session.flush()
        ProjectCorrelationDAO.create_correlation(
            project_id=self._properties["project_id"],
            object_id=folder.id,
            object_type=ProjectCorrelationType.FOLDER,
        )
        return folder

    def validate(self) -> None:
        if is_feature_enabled("DASHBOARD_FOLDER") is False:
            raise ValidationError("Folder feature is not supported yet.")


