from flask_appbuilder import Model
from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship, backref

from superset import security_manager
from superset.models.dashboard import Dashboard

ab_user_folder_table = Table(
    'ab_user_folder',
    Model.metadata,
    Column("folder_id", Integer, ForeignKey("folder.id")),
    Column("user_id", Integer, ForeignKey("ab_user.id"))
)

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

    users = relationship(
        security_manager.user_model,
        secondary=ab_user_folder_table,
    )


class FolderDashboardCorrelation(Model):
    __tablename__ = 'folder_dashboard_correlation'
    folder_id = Column(Integer, ForeignKey(Folder.id), primary_key=True)
    dashboard_id = Column(Integer, ForeignKey(Dashboard.id), primary_key=True)
    sort_order = Column(Integer, nullable=False, default=-1)
