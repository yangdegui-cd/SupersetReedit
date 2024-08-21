from flask_appbuilder import Model
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    UniqueConstraint,
    Text,
)
from sqlalchemy.orm import relationship

from superset.models.core import Database


class Project(Model):
    __tablename__ = "ab_project"

    id = Column(Integer, primary_key=True)
    project_id = Column(String(256))
    name = Column(String(256), nullable=False)
    project_name = Column(String(256), index=True)
    attrs_json = Column(Text, nullable=True)


class UserProject(Model):
    __tablename__ = "ab_user_project"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("ab_user.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("ab_project.id"), nullable=False)

    user = relationship("User")
    project = relationship("Project")

    __table_args__ = (
        UniqueConstraint('user_id', 'project_id', name='user_project_unique_constraint')
    )
