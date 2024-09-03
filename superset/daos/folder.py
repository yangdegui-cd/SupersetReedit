from __future__ import annotations

from typing import Any

from superset.daos.base import BaseDAO, T
from superset.folder.models import Folder


class FolderDAO(BaseDAO[Folder]):

    @staticmethod
    def create(
        cls,
        item: T | None = None,
        attributes: dict[str, Any] | None = None,
    ) -> T:
        """
        Create an object from the specified item and/or attributes.
        """
        if item:
            return item
        return Folder(**attributes)
