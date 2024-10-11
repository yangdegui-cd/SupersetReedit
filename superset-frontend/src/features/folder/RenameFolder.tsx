import { Input, Modal } from 'antd';
// eslint-disable-next-line no-restricted-syntax
import React, { useState } from 'react';
import Form from 'antd/lib/form';
import { t } from '@superset-ui/core';

export default function RenameDashboardFolder({
  open,
  setOpen,
  value = undefined,
  onSaved,
  onCanceled,
  title,
}: {
  open: boolean;
  setOpen?: (open: boolean) => void;
  value?: string;
  onSaved?: (new_name: string) => void;
  onCanceled?: () => void;
  title?: string;
}) {
  const [folderName, setFolderName] = useState(value);

  function handleCancel() {
    setOpen?.(false);
    onCanceled?.();
  }

  return (
    <Modal
      title={title || t('Rename')}
      okText={t('Save')}
      cancelText={t('Cancel')}
      visible={open}
      onOk={() => onSaved?.(folderName ?? '')}
      onCancel={() => (onCanceled ? onCanceled() : handleCancel())}
    >
      <Form name="control-rename" layout="vertical">
        <Form.Item
          name="folder_name"
          label={t('New folder name')}
          rules={[{ required: true }]}
        >
          <Input
            defaultValue={value}
            onChange={value => setFolderName(value.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
