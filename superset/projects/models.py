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


class ProjectCorrelationType(Enum):
    DASHBOARD = "dashboard"
    SLICE = "slice"
    DATASET = "dataset"
    USER = "user"


class ProjectCorrelationObject(Model, AuditMixinNullable):
    """An association between an object and a tag."""

    __tablename__ = "project_correlation_object"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("ab_project.id"))
    object_id = Column(
        Integer,
        ForeignKey("dashboards.id"),
        ForeignKey("slices.id"),
        ForeignKey("datasets.id"),
        ForeignKey("ab_user.id"),
    )
    object_type = Column(Enum(ProjectCorrelationType))

    project = relationship("Project", back_populates="objects")

    __table_args__ = (
        UniqueConstraint(
            "project_id", "object_id", "object_type", name="uix_pco"
        ),
    )

    def __str__(self) -> str:
        return f"<TaggedObject: {self.object_type}:{self.object_id} TAG:{self.project_id}>"
