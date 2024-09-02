/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// eslint-disable-next-line no-restricted-syntax
import React, { useMemo, useState } from 'react';
import { SupersetClient, t } from '@superset-ui/core';

import rison from 'rison';
import { useListViewResource } from 'src/views/CRUD/hooks';
import { createErrorHandler } from 'src/views/CRUD/utils';
import withToasts from 'src/components/MessageToasts/withToasts';
import SubMenu, { SubMenuProps } from 'src/features/home/SubMenu';
import DeleteModal from 'src/components/DeleteModal';
import ConfirmStatusChange from 'src/components/ConfirmStatusChange';
import ActionsBar, { ActionProps } from 'src/components/ListView/ActionsBar';
import ListView, {
  FilterOperator,
  Filters,
  ListViewProps,
} from 'src/components/ListView';
import { ProjectObject } from '../../types/bootstrapTypes';
import AddProjectModel from '../../features/projects/AddProject/AddProjectModal';
import SetProjectManager from '../../features/projects/SetManager';

const PAGE_SIZE = 25;

interface ProjectListProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  user: {
    userId: string | number;
    firstName: string;
    lastName: string;
  };
}

function ProjectList({ addDangerToast, addSuccessToast }: ProjectListProps) {
  const {
    state: {
      loading,
      resourceCount: projectCount,
      resourceCollection: projects,
      bulkSelectEnabled,
    },
    fetchData,
    refreshData,
    toggleBulkSelect,
  } = useListViewResource<ProjectObject>(
    'project',
    t('Project'),
    addDangerToast,
  );
  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false);

  const [managerModalOpen, setManagerModalOpen] = useState<boolean>(false);

  const [projectDeleting, setProjectDeleting] = useState<ProjectObject | null>(
    null,
  );
  const [, setCurrentProject] = useState<ProjectObject | null>(null);

  const handleProjectDelete = ({ id, project_name }: ProjectObject) => {
    SupersetClient.delete({
      endpoint: `/api/v1/project/${id}`,
    }).then(
      () => {
        refreshData();
        setProjectDeleting(null);
        addSuccessToast(t('Deleted: %s', project_name));
      },
      createErrorHandler(errMsg =>
        addDangerToast(
          t('There was an issue deleting %s: %s', project_name, errMsg),
        ),
      ),
    );
  };

  const handleBulkProjectDelete = (projectsToDelete: ProjectObject[]) => {
    SupersetClient.delete({
      endpoint: `/api/v1/project/?q=${rison.encode(
        projectsToDelete.map(({ id }) => id),
      )}`,
    }).then(
      ({ json = {} }) => {
        refreshData();
        addSuccessToast(json.message);
      },
      createErrorHandler(errMsg =>
        addDangerToast(
          t('There was an issue deleting the selected projects: %s', errMsg),
        ),
      ),
    );
  };

  function handleProjectEdit(project: ProjectObject) {
    setCurrentProject(project);
    setProjectModalOpen(true);
  }

  const initialSort = [{ id: 'project_name', desc: true }];
  const columns = useMemo(
    () => [
      {
        accessor: 'project_name',
        Header: t('Name'),
      },
      {
        Cell: ({ row: { original } }: any) => {
          const handleEdit = () => handleProjectEdit(original);
          const handleDelete = () => setProjectDeleting(original);
          const actions = [
            {
              label: 'edit-action',
              tooltip: t('Edit project'),
              placement: 'bottom',
              icon: 'Edit',
              onClick: handleEdit,
            },
            {
              label: 'delete-action',
              tooltip: t('Delete project'),
              placement: 'bottom',
              icon: 'Trash',
              onClick: handleDelete,
            },
          ].filter(item => !!item);
          return <ActionsBar actions={actions as ActionProps[]} />;
        },
        Header: t('Actions'),
        id: 'actions',
        disableSortBy: true,
        size: 'xl',
      },
    ],
    [],
  );

  const menuData: SubMenuProps = {
    name: t('Projects'),
  };

  const subMenuButtons: SubMenuProps['buttons'] = [];

  subMenuButtons.push({
    name: (
      <>
        <i className="fa fa-plus" /> {t('Project')}
      </>
    ),
    buttonStyle: 'primary',
    onClick: () => {
      setCurrentProject(null);
      setProjectModalOpen(true);
    },
  });

  subMenuButtons.push({
    name: t('Bulk select'),
    onClick: toggleBulkSelect,
    buttonStyle: 'secondary',
  });

  subMenuButtons.push({
    name: t('Set manager'),
    buttonStyle: 'primary',
    onClick: () => {
      setManagerModalOpen(true);
    },
  });

  menuData.buttons = subMenuButtons;

  const filters: Filters = useMemo(
    () => [
      {
        Header: t('Name'),
        key: 'search',
        id: 'project_name',
        input: 'search',
        operator: FilterOperator.Contains,
      },
    ],
    [],
  );
  return (
    <>
      <AddProjectModel open={projectModalOpen} setOpen={setProjectModalOpen} />
      <SetProjectManager
        open={managerModalOpen}
        setOpen={setManagerModalOpen}
        projects={projects}
      />
      <SubMenu {...menuData} />
      {projectDeleting && (
        <DeleteModal
          description={t('This action will permanently delete the project.')}
          onConfirm={() => {
            if (projectDeleting) {
              handleProjectDelete(projectDeleting);
            }
          }}
          onHide={() => setProjectDeleting(null)}
          open
          title={t('Delete Project?')}
        />
      )}
      <ConfirmStatusChange
        title={t('Please confirm')}
        description={t(
          'Are you sure you want to delete the selected projects?',
        )}
        onConfirm={handleBulkProjectDelete}
      >
        {confirmDelete => {
          const bulkActions: ListViewProps['bulkActions'] = [
            {
              key: 'delete',
              name: t('Delete'),
              onSelect: confirmDelete,
              type: 'danger',
            },
          ];

          return (
            <ListView<ProjectObject>
              className="css-templates-list-view"
              columns={columns}
              count={projectCount}
              data={projects}
              fetchData={fetchData}
              filters={filters}
              initialSort={initialSort}
              loading={loading}
              pageSize={PAGE_SIZE}
              bulkActions={bulkActions}
              bulkSelectEnabled={bulkSelectEnabled}
              disableBulkSelect={toggleBulkSelect}
              addDangerToast={addDangerToast}
              addSuccessToast={addSuccessToast}
              refreshData={refreshData}
            />
          );
        }}
      </ConfirmStatusChange>
    </>
  );
}

export default withToasts(ProjectList);
