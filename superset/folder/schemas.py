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

from marshmallow import fields, Schema
from marshmallow.validate import Length


class FolderPostSchema(Schema):
    name = fields.String(required=True, validate=Length(1, 255))
    parent_folder_id = fields.Integer(required=False)


class FolderSaveSortSchema(Schema):
    key = fields.Str()
    title = fields.Str()
    children = fields.List(fields.Nested(lambda: FolderSaveSortSchema()))
    isLeaf = fields.Bool()
