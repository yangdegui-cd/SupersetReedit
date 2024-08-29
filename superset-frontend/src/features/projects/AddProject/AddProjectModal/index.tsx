// eslint-disable-next-line no-restricted-syntax
import React, { Dispatch, SetStateAction } from 'react';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { SupersetClient, t } from '@superset-ui/core';
import { ProjectObject } from 'src/types/bootstrapTypes';
import { Form, FormProps, Input, Modal } from 'antd-v5';

const AddProjectModel = ({
  open,
  setOpen,
  project,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  project?: ProjectObject;
}) => {
  const current_project: ProjectObject = project ?? {
    name: '',
    project_name: '',
  };
  const { addSuccessToast, addDangerToast } = useToasts();
  const onFinish = () => {
    SupersetClient.post({
      endpoint: '/api/v1/project/',
      body: JSON.stringify(current_project),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => addSuccessToast('add project success'))
      .catch(error =>
        addDangerToast(`add project error with: ${error.message}`),
      )
      .finally(() => setOpen(false));
  };

  const onFinishFailed: FormProps<ProjectObject>['onFinishFailed'] =
    errorInfo => {
      addDangerToast(`Failed: ${errorInfo.errorFields?.[0].errors}`);
    };

  const cancel = () => setOpen(false);
  const nameChange = (event: any) => {
    current_project.name = event.target.value;
  };
  const projectNameChange = (event: any) => {
    current_project.project_name = event.target.value;
  };

  return (
    <Modal
      title="Add project"
      centered
      open={open}
      onOk={onFinish}
      onCancel={cancel}
      width={400}
    >
      <Form
        name="basic"
        layout="vertical"
        style={{ maxWidth: 400 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<ProjectObject>
          label={t('Project Name')}
          name="name"
          rules={[
            { required: true, message: 'Please input add project name!' },
          ]}
        >
          <Input value={current_project.name} onChange={nameChange} />
        </Form.Item>
        <Form.Item<ProjectObject>
          label={t('Project Display Name')}
          name="project_name"
          rules={[
            { required: true, message: 'Please input project display name!' },
          ]}
        >
          <Input
            value={current_project.project_name}
            onChange={projectNameChange}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProjectModel;
