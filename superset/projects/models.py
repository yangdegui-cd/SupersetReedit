import enum

from flask_appbuilder import Model
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    UniqueConstraint,
    Text,
    Enum,
)
from sqlalchemy.orm import relationship


class Project(Model):
    __tablename__ = "ab_project"

    id = Column(Integer, primary_key=True)
    project_id = Column(String(256))
    name = Column(String(256), nullable=False)
    project_name = Column(String(256), index=True)
    attrs_json = Column(Text, nullable=True)

    users = relationship(
        'User',
        secondary="project_correlation_object",
        secondaryjoin="and_(User.id == ProjectCorrelationObject.object_id, "
                      "ProjectCorrelationObject.object_type == 'user')",
        primaryjoin="ProjectCorrelationObject.project_id == Project.id",
        viewonly=True,
    )

    slices = relationship(
        "Slice",
        secondary="project_correlation_object",
        secondaryjoin="and_(Slice.id == ProjectCorrelationObject.object_id, "
                      "ProjectCorrelationObject.object_type == 'slice')",
        primaryjoin="ProjectCorrelationObject.project_id == Project.id",
        viewonly=True,
    )

    dashboards = relationship(
        "Dashboard",
        secondary="project_correlation_object",
        secondaryjoin="and_(Dashboard.id == ProjectCorrelationObject.object_id, "
                      "ProjectCorrelationObject.object_type == 'dashboard')",
        primaryjoin="ProjectCorrelationObject.project_id == Project.id",
        viewonly=True,
    )

    tables = relationship(
        "SqlaTable",
        secondary="project_correlation_object",
        secondaryjoin="and_(SqlaTable.id == ProjectCorrelationObject.object_id, "
                      "ProjectCorrelationObject.object_type == 'dataset')",
        primaryjoin="ProjectCorrelationObject.project_id == Project.id",
        viewonly=True,
    )


class ProjectCorrelationType(enum.Enum):
    DASHBOARD = "dashboard"
    SLICE = "slice"
    DATASET = "dataset"
    USER = "user"
    FOLDER = "folder"

    @staticmethod
    def from_model(model):
        if model.__name__ == "Dashboard":
            return ProjectCorrelationType.DASHBOARD
        if model.__name__ == "Slice":
            return ProjectCorrelationType.SLICE
        if model.__name__ == "SqlaTable":
            return ProjectCorrelationType.DATASET
        if model.__name__ == "User":
            return ProjectCorrelationType.USER
        if model.__name__ == "Folder":
            return ProjectCorrelationType.FOLDER
        raise ValueError(f"Unsupported model type: {model.__name__}")


class ProjectCorrelationObject(Model):
    """An association between an object and a tag."""

    __tablename__ = "project_correlation_object"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("ab_project.id"))
    object_id = Column(
        Integer,
        ForeignKey("dashboards.id"),
        ForeignKey("slices.id"),
        ForeignKey("tables.id"),
        ForeignKey("ab_user.id"),
    )
    object_type = Column(Enum(ProjectCorrelationType))

    __table_args__ = (
        UniqueConstraint(
            "project_id", "object_id", "object_type", name="uix_pco"
        ),
    )

    def __str__(self) -> str:
        return f"<TaggedObject: {self.object_type}:{self.object_id} TAG:{self.project_id}>"
