import { Input, Modal } from 'antd';
import { SupersetClient, t } from '@superset-ui/core';
import Form from 'antd/lib/form';
import React, { useEffect, useState } from 'react';
import Select from 'antd/lib/select';
import { useSelector } from 'react-redux';
import { apiSetManager } from './api';
import { RootState } from '../../views/store';
import { useToasts } from '../../components/MessageToasts/withToasts';
import { DashboardFolder } from './types';
import { createErrorHandler } from '../../views/CRUD/utils';

export default function SetDashboardFolderManager({
  open,
  onSaved,
  onCanceled,
  data,
}: {
  open: boolean;
  data: DashboardFolder;
  onSaved: Function;
  onCanceled: Function;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [chooseUsers, setChooseUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const current_project = useSelector(
    (state: RootState) => state.current_project,
  );
  const { addSuccessToast, addDangerToast } = useToasts();
  const getManagerList = (id: number) => {
    setLoading(true);
    SupersetClient.get({
      endpoint: `/api/v1/project/get_managers/${id}`,
      headers: { 'Content-Type': 'application/json' },
    })
      .then(({ json }: any) => {
        setUsers(json.data.managers.map((v: any) => v));
        console.log(json.data.managers.map((v: any) => v));
      })
      .catch(error => {
        addDangerToast('get project managers list error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open) return;
    getManagerList(current_project);
  }, [current_project, open]);

  useEffect(() => {
    if (!open) return;
    setChooseUsers([]);
  }, []);
  function handleOk() {
    apiSetManager(data.id as number, chooseUsers).then(
      r => {
        addSuccessToast(t('Set manager success'));
        onSaved();
      },
      createErrorHandler(errMsg =>
        addDangerToast(
          t('An error occurred while rename dashboard folder: %s', errMsg),
        ),
      ),
    );
  }

  return (
    <Modal
      title={t('Set manager')}
      okText={t('Save')}
      cancelText={t('Cancel')}
      visible={open}
      onOk={handleOk}
      onCancel={() => onCanceled()}
    >
      <Form name="control-add" layout="vertical">
        <Form.Item
          name="folder_name"
          label={t('Folder name')}
          rules={[{ required: true }]}
        >
          <Input defaultValue={data.name} disabled />
        </Form.Item>
        <Form.Item name="managers" label={t('Users')}>
          <Select
            mode="multiple"
            placeholder={t('Please select managers')}
            defaultValue={chooseUsers}
            onChange={(value: number[]) => setChooseUsers(value)}
            loading={loading}
          >
            {users.map((user: any) => (
              <Select.Option key={user.id} value={user.id}>
                {user.first_name}
                {user.last_name}(
                {/* eslint-disable-next-line theme-colors/no-literal-colors */}
                <span style={{ color: '#726f6f' }}>{user.email}</span>)
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
