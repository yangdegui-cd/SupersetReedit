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

from flask import Response, g, session, request
from flask_appbuilder import has_access, permission_name
from flask_appbuilder.api import expose, safe
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import protect
from flask_appbuilder.security.sqla.models import User
from flask_jwt_extended.exceptions import NoAuthorizationError
from marshmallow import ValidationError

from superset import event_logger, db
from superset.commands.projects.create import CreateProjectCommand
from superset.commands.projects.set_managers import SetManagersCommand
from superset.constants import RouteMethod, MODEL_API_RW_METHOD_PERMISSION_MAP
from superset.daos.project import ProjectDAO, UserProjectDAO
from superset.projects.models import Project, UserProject
from superset.projects.schemas import ProjectPostSchema, SetProjectManagersSchema, \
    SetManagerProjectsSchema
from superset.utils.core import set_project, get_project_id
from superset.views.base_api import (
    BaseSupersetModelRestApi, requires_json, statsd_metrics,
)
from superset.views.users.schemas import UserResponseSchema

logger = logging.getLogger(__name__)


class ProjectRestApi(BaseSupersetModelRestApi):
    datamodel = SQLAInterface(Project)

    resource_name = "project"
    allow_browser_login = True
    class_permission_name = "Project"
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    include_route_methods = RouteMethod.REST_MODEL_VIEW_CRUD_SET | {
        "get_list_by_manager",
    }
    list_columns = ["id", "name", "project_name", ]
    edit_columns = ["project_name"]
    add_columns = ["name", "project_name"]
    search_columns = ["project_name"]

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
        return self.response(400, message="todo: implement")

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
        return self.response(400, message="todo: implement")
