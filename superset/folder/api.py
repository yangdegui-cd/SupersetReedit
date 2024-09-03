import logging

from flask import request
from flask_appbuilder.api import expose, safe
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import protect
from marshmallow import ValidationError

from superset import event_logger
from superset.commands.folder.create import CreateFolderCommand
from superset.constants import RouteMethod, MODEL_API_RW_METHOD_PERMISSION_MAP
from superset.folder.models import Folder
from superset.folder.schemas import FolderPostSchema
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
    }

    method_permission_name = {
        **MODEL_API_RW_METHOD_PERMISSION_MAP,
    }

    add_model_schema = FolderPostSchema()

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
            return self.response_500(message=ex.normalized_messages())
