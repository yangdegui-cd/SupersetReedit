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
"""add project to tables

Revision ID: 20e97d6d6875
Revises: 48cbb571fa3a
Create Date: 2024-08-27 07:38:30.924760

"""

# revision identifiers, used by Alembic.
revision = '20e97d6d6875'
down_revision = '48cbb571fa3a'

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        'ab_project',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.String(length=256), nullable=True),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('project_name', sa.String(length=256), nullable=True),
        sa.Column('attrs_json', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ab_project_project_name'), 'ab_project', ['project_name'],
                    unique=False)
    op.create_table(
        'project_correlation_object',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('object_id', sa.Integer(), nullable=True),
        sa.Column('object_type',
                  sa.Enum('DASHBOARD', 'SLICE', 'DATASET', 'USER',
                          name='projectcorrelationtype'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['ab_project.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'object_id', 'object_type',
                            name='uix_pco')
    )


def downgrade():
    op.drop_table('project_correlation_object')
    op.drop_index(op.f('ix_ab_project_project_name'), table_name='ab_project')
    op.drop_table('ab_project')
    # ### end Alembic commands ###
