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

from superset.models.helpers import AuditMixinNullable


class Project(Model):
    __tablename__ = "ab_project"

    id = Column(Integer, primary_key=True)
    project_id = Column(String(256))
    name = Column(String(256), nullable=False)
    project_name = Column(String(256), index=True)
    attrs_json = Column(Text, nullable=True)


class ProjectCorrelationType(enum.Enum):
    DASHBOARD = "dashboard"
    SLICE = "slice"
    DATASET = "dataset"
    USER = "user"


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
