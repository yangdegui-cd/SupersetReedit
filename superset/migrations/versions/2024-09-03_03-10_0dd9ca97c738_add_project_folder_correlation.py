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
"""add project folder correlation

Revision ID: 0dd9ca97c738
Revises: 85ceef8fc082
Create Date: 2024-09-03 03:10:33.582892

"""

# revision identifiers, used by Alembic.
revision = '0dd9ca97c738'
down_revision = '85ceef8fc082'

import sqlalchemy as sa
from alembic import op


def upgrade():
    # Adding new value to the enum type in PostgreSQL
    op.alter_column(
        'project_correlation_object',
        'object_type',
        existing_type=sa.Enum('DASHBOARD', 'SLICE', 'DATASET', 'USER', 'FOLDER',
                              name='projectcorrelationtype'),
        nullable=False,
    )


def downgrade():
    op.alter_column(
        'project_correlation_object',
        'object_type',
        existing_type=sa.Enum('DASHBOARD', 'SLICE', 'DATASET', 'USER',
                              name='projectcorrelationtype'),
        nullable=False,
    )
