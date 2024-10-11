from flask_appbuilder import Model
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, backref

from superset.models.dashboard import Dashboard


class Folder(Model):
    __tablename__ = 'folder'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    sort_order = Column(Integer, nullable=False, default=-1)

    parent_folder_id = Column(Integer, ForeignKey('folder.id'), nullable=True)
    parent = relationship(
        'Folder',
        remote_side=[id],
        backref=backref(
            'children',
            order_by="Folder.sort_order",
            cascade='all, delete-orphan'
        )
    )

    dashboards = relationship(
        'Dashboard',
        secondary='folder_dashboard_correlation',
        backref=backref('folder', uselist=False),
        order_by="FolderDashboardCorrelation.sort_order"
    )


class FolderDashboardCorrelation(Model):
    __tablename__ = 'folder_dashboard_correlation'
    folder_id = Column(Integer, ForeignKey(Folder.id), primary_key=True)
    dashboard_id = Column(Integer, ForeignKey(Dashboard.id), primary_key=True)
    sort_order = Column(Integer, nullable=False, default=-1)
