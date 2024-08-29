# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# pylint: disable=too-many-lines
import logging

from flask import Response, g, request, session
from flask_appbuilder import has_access, permission_name
from flask_appbuilder.api import expose, safe
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import protect
from flask_jwt_extended.exceptions import NoAuthorizationError
from marshmallow import ValidationError

from superset import event_logger, db, is_feature_enabled
from superset.commands.project.create import CreateProjectCommand
from superset.constants import RouteMethod, MODEL_API_RW_METHOD_PERMISSION_MAP
from superset.daos.project import ProjectDAO
from superset.projects.models import Project
from superset.projects.schemas import ProjectPostSchema
from superset.utils.core import get_project_id, set_project
from superset.views.base_api import (
    BaseSupersetModelRestApi, requires_json, statsd_metrics,
)

logger = logging.getLogger(__name__)


class ProjectRestApi(BaseSupersetModelRestApi):
    datamodel = SQLAInterface(Project)

    resource_name = "project"
    allow_browser_login = True
    class_permission_name = "Project"
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET | {
        "get_list_by_manager",
        "change_project",
    }
    list_columns = ["id", "name", "project_name", ]
    edit_columns = ["project_name"]
    add_columns = ["name", "project_name"]
    search_columns = ["project_name"]
    add_model_schema = ProjectPostSchema()

    @expose("/", methods=("POST",))
    @protect()
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.post",
        log_to_statsd=False,
    )
    @requires_json
    def post(self) -> Response:
        try:
            item = self.add_model_schema.load(request.json)
        except ValidationError as error:
            return self.response_400(message=error.messages)
        try:
            new_model = CreateProjectCommand(item).run()
            return self.response(201, id=new_model.id)
        except ValidationError as ex:
            return self.response_400(message=ex.messages)

    @expose("/get_list_by_manager", methods=("GET",))
    @has_access
    @permission_name("read")
    @statsd_metrics
    @safe
    @event_logger.log_this_with_context(
        action=lambda self, *args,
                      **kwargs: f"{self.__class__.__name__}.get_list_by_manager",
        log_to_statsd=False,
    )
    def get_list_by_manager(self) -> Response:
        try:
            if g.user is None or g.user.is_anonymous:
                return self.response_401()
        except NoAuthorizationError:
            return self.response_401()
        projects = ProjectDAO.get_list_by_user(g.user)
        current_project = get_project_id(request)
        if not current_project and is_feature_enabled("USE_PROJECT"):
            current_project = projects[0].id if projects else None
            set_project(request, current_project)
        return self.response(200, data={
            "projects": list(
                map(lambda x: {"id": x.id, "project_name": x.project_name}, projects)),
            "current_project": current_project
        })

    @expose("/change_project/<int:project_id>", methods=("GET",))
    @safe
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args,
                      **kwargs: f"{self.__class__.__name__}.change_project",
        log_to_statsd=False,
    )
    def change_project(self, project_id: int) -> Response:
        try:
            if g.user is None or g.user.is_anonymous:
                return self.response_401()
        except NoAuthorizationError:
            return self.response_401()
        # Replace with the actual logic to get the project_id
        is_manager = ProjectDAO.is_manager(g.user, project_id)

        if is_manager:
            set_project(request, project_id)
            # Set the session variable
            return self.response(200, message="Project changed successfully")
        else:
            return self.response(400, message="Not authorized to change project")
