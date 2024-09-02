import { Modal, Radio, Select } from 'antd-v5';
// eslint-disable-next-line no-restricted-syntax
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { SupersetClient, t } from '@superset-ui/core';
import Form from 'antd/lib/form';
import { ProjectObject } from 'src/types/bootstrapTypes';
import { createErrorHandler } from '../../../views/CRUD/utils';

const SetProjectManager = ({
  open,
  setOpen,
  projects,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  projects: ProjectObject[];
}) => {
  const { addSuccessToast, addDangerToast } = useToasts();
  const [editProject, setEditProject] = useState<number>();
  const [projectManagers, setProjectManagers] = useState<number[]>([]);
  const [managers, setManagers] = useState<{ id: number; name: number }[]>([]);
  const [mangersLoading, setMangersLoading] = useState(false);
  const [addType, setAddType] = useState<'byProject' | 'byManger'>('byProject');
  const [managerProjects, setManagerProjects] = useState<number[]>([]);
  const [manager, setManager] = useState<number | undefined>(undefined);
  const cancel = () => setOpen(false);

  const projectChange = (id: number) => {
    setEditProject(id);
    getManagerList(id);
  };
  const mangersChange = (list: number[]) => {
    setProjectManagers(list);
  };

  const getManagerList = (id: number) => {
    setMangersLoading(true);
    SupersetClient.get({
      endpoint: `/api/v1/project/get_managers/${id}`,
      headers: { 'Content-Type': 'application/json' },
    })
      .then(
        ({ json }: any) => {
          setManagers(json.data.all);
          setProjectManagers(json.data.managers.map((v: any) => v.id));
        },
        createErrorHandler(errMsg =>
          addDangerToast(`get project managers list error: ${errMsg}`),
        ),
      )
      .finally(() => setMangersLoading(false));
  };

  const getManagerProjects = (id: number) => {
    setMangersLoading(true);
    SupersetClient.get({
      endpoint: `/api/v1/project/get_projects/${id}`,
      headers: { 'Content-Type': 'application/json' },
    })
      .then(
        ({ json }: any) => {
          setManagerProjects(json.projects);
        },
        createErrorHandler(errMsg =>
          addDangerToast(`get project managers list error: ${errMsg}`),
        ),
      )
      .finally(() => setMangersLoading(false));
  };

  const onFinish = () => {
    const api =
      addType === 'byProject'
        ? SupersetClient.post({
            endpoint: '/api/v1/project/set_managers_by_project',
            body: JSON.stringify({
              project_id: editProject,
              manager_ids: projectManagers,
            }),
            headers: { 'Content-Type': 'application/json' },
          })
        : SupersetClient.post({
            endpoint: '/api/v1/project/set_managers_by_manager',
            body: JSON.stringify({
              manager_id: manager,
              project_ids: managerProjects,
            }),
            headers: { 'Content-Type': 'application/json' },
          });

    api.then(
      () => {
        addSuccessToast(`set project managers success!`);
        setOpen(false);
      },
      createErrorHandler(errMsg =>
        addDangerToast(`set project managers error, msg: ${errMsg}`),
      ),
    );
  };

  return (
    <Modal
      title="Set managers"
      centered
      open={open}
      onOk={onFinish}
      onCancel={cancel}
      okText={t('Save')}
      cancelText={t('Cancel')}
      width={500}
    >
      <Form
        name="basic"
        style={{ maxWidth: 500 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item<ProjectObject> name="add_type">
          <Radio.Group
            options={[
              { label: '按项目', value: 'byProject' },
              { label: '按用户', value: 'byManger' },
            ]}
            defaultValue="byProject"
            onChange={e => setAddType(e.target.value)}
            value={addType}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>
        {addType === 'byProject' && (
          <>
            <Form.Item
              label={t('Project')}
              name="project_name"
              rules={[{ required: true, message: 'Please choose project' }]}
            >
              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder="Please select project"
                onChange={projectChange}
                options={projects.map(project => ({
                  value: project.id ?? -1,
                  label: project.project_name,
                }))}
              />
            </Form.Item>
            <Form.Item
              label={t('Managers')}
              rules={[
                {
                  required: true,
                  message: 'Please select at least one manager!',
                },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder={t('Please select multiple managers')}
                value={projectManagers}
                onChange={mangersChange}
                loading={mangersLoading}
                disabled={editProject === undefined || editProject === null}
                options={managers.map((manager: any) => ({
                  value: manager.id,
                  label: manager.username,
                }))}
              />
            </Form.Item>
          </>
        )}
        {addType === 'byManger' && (
          <>
            <Form.Item
              label={t('Manager')}
              rules={[
                {
                  required: true,
                  message: 'Please select at least one manager!',
                },
              ]}
            >
              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder="Please select manager"
                value={manager}
                onChange={value => {
                  setManager(value);
                  getManagerProjects(value);
                }}
                options={managers.map((manager: any) => ({
                  value: manager.id,
                  label: manager.username,
                }))}
              />
            </Form.Item>
            <Form.Item
              label={t('Project')}
              rules={[
                {
                  required: true,
                  message: 'Please select at least one project!',
                },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Please select project"
                value={managerProjects}
                onChange={values => setManagerProjects(values)}
                disabled={!manager}
                options={projects.map(project => ({
                  value: project.id ?? -1,
                  label: project.project_name,
                }))}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default SetProjectManager;
