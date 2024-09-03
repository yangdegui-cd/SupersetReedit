from flask_appbuilder.models.sqla.interface import SQLAInterface

from superset.constants import RouteMethod, MODEL_API_RW_METHOD_PERMISSION_MAP
from superset.folder.models import Folder
from superset.views.base_api import BaseSupersetModelRestApi


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

