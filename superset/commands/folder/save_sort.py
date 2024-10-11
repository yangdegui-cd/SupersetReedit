from typing import List, Dict, Any

from sqlalchemy import update

from superset import db
from superset.commands.base import BaseCommand
from superset.folder.models import Folder, FolderDashboardCorrelation


class SaveSortDashboardFolderCommand(BaseCommand):
    def __init__(self, data: List[Dict[str, Any]]):
        self.data = data.copy()

    def run(self):
        self.validate()
        for i, properties in enumerate(self.data):
            self.save_sort_and_parent(properties, i)

        db.session.commit()

    def save_sort_and_parent(self, properties,
                             sort_order: int,
                             parent_id: int = None) -> None:
        is_leaf = properties.get("isLeaf")
        if is_leaf:
            dashboard_id = properties.get("key").replace("d_", "")
            update_stmt = (update(FolderDashboardCorrelation)
                           .where(FolderDashboardCorrelation.dashboard_id == dashboard_id)
                           .values(folder_id=parent_id, sort_order=sort_order))
            db.session.execute(update_stmt)
        else:
            folder_id = properties.get("key").replace("f_", "")
            update_stmt = update(Folder).where(
                Folder.id == folder_id).values(
                parent_folder_id=parent_id, sort_order=sort_order)
            db.session.execute(update_stmt)
            if properties.get("children"):
                for i, sub_folder in enumerate(properties.get("children")):
                    self.save_sort_and_parent(
                        sub_folder,
                        i,
                        folder_id
                    )

    def validate(self) -> None:
        pass
