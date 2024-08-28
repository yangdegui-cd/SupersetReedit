from flask_appbuilder import expose
from flask_appbuilder.models.sqla.interface import SQLAInterface
from superset.projects.models import Project
from superset.superset_typing import FlaskResponse
from superset.views.base import SupersetModelView, DeleteMixin
from flask_babel import lazy_gettext as _


class ProjectView(SupersetModelView, DeleteMixin, ):
    route_base = "/project"
    datamodel = SQLAInterface(Project)

    list_title = _("Project")
    show_title = _("Show Projects")
    add_title = _("Add Project")
    edit_title = _("Edit Project")

    list_columns = ["project_name"]
    edit_columns = ["project_name"]
    add_columns = edit_columns
    label_columns = {"project_name": _("Project Name")}

    @expose("/list/")
    def list(self) -> FlaskResponse:
        return super().render_app_template()

    @expose("/add/")
    def add(self) -> FlaskResponse:
        return super().render_app_template()
