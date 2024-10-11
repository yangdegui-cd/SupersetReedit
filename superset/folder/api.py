import logging

from flask import request
from flask_appbuilder.api import expose, safe
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import protect
from marshmallow import ValidationError

from superset import event_logger
from superset.commands.folder.create import CreateFolderCommand
from superset.commands.folder.save_sort import SaveSortDashboardFolderCommand
from superset.constants import RouteMethod, MODEL_API_RW_METHOD_PERMISSION_MAP
from superset.daos.folder import FolderDAO
from superset.folder.models import Folder
from superset.folder.schemas import FolderPostSchema,FolderSaveSortSchema
from superset.utils.core import get_project_id
from superset.views.base_api import BaseSupersetModelRestApi, statsd_metrics, \
    requires_json

logger = logging.getLogger(__name__)


class FolderRestApi(BaseSupersetModelRestApi):
    datamodel = SQLAInterface(Folder)
    resource_name = "folder"

    allow_browser_login = True
    class_permission_name = "Folder"
    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET | {
        RouteMethod.EXPORT,
        RouteMethod.IMPORT,
        RouteMethod.RELATED,
        'get_list',
        'save_sort'
    }

    method_permission_name = {
        **MODEL_API_RW_METHOD_PERMISSION_MAP,
        "get_list": "read",
        "save_sort": "write",
    }

    edit_columns = ["name"]

    add_model_schema = FolderPostSchema()
    save_sort_schema = FolderSaveSortSchema(many=True)

    @expose("/", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.post",
    )
    @requires_json
    def post(self):
        try:
            item = self.add_model_schema.load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            item["project_id"] = get_project_id(request)
            CreateFolderCommand(item).run()
            return self.response(201)
        except Exception as ex:
            logger.error(
                "Error creating model %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )
            return self.response_500(message=ex.__str__())

    @expose("/get_list", methods=("get",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=False,
    )
    def get_list(self):
        result = FolderDAO.get_dashboards(get_project_id(request))
        return self.response(200, result=result)

    @expose("/save_sort", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @requires_json
    def save_sort(self):
        try:
            item = self.save_sort_schema.load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)

        try:
            SaveSortDashboardFolderCommand(item).run()
            return self.response(201)
        except Exception as ex:
            logger.error(
                "Error creating model %s: %s",
                self.__class__.__name__,
                str(ex),
                exc_info=True,
            )
            return self.response_422(message=str(ex))
