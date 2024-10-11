import { Input, Modal } from 'antd';
// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useState } from 'react';
import { t } from '@superset-ui/core';
// import FolderPickerTree from './FolderPickerTree';
import { Form } from 'antd-v5';
import { apiAddFolder } from './api';
import { useToasts } from '../../components/MessageToasts/withToasts';
import { createErrorHandler } from '../../views/CRUD/utils';

function AddDashboardFolder({
  open,
  setOpen,
  value = undefined,
  parent = undefined,
  onSaved,
  onCanceled,
}: {
  open: boolean;
  setOpen: Function;
  value?: string;
  parent?: number;
  onSaved?: Function;
  onCanceled?: Function;
}) {
  const [folderName, setFolderName] = useState('');
  const [folderParent, setFolderParent] = useState<undefined | number>(
    undefined,
  );
  const [disabledChooseParent, setDisabledChooseParent] = useState(false);
  const { addSuccessToast, addDangerToast } = useToasts();

  function handleOk() {
    apiAddFolder(folderName, folderParent)
      .then(
        () => {
          addSuccessToast(t('add folder success'));
          onSaved?.();
          setFolderName('');
          setFolderParent(undefined);
        },
        createErrorHandler(errMsg =>
          addDangerToast(
            t('An error occurred while adding dashboard folder: %s', errMsg),
          ),
        ),
      )
      .finally(setOpen(false));
  }

  function handleCancel() {
    setOpen(false);
    onCanceled?.();
  }

  useEffect(() => {
    if (value) setFolderName(folderName);
    if (parent) {
      setFolderParent(parent);
      setDisabledChooseParent(true);
    } else {
      setDisabledChooseParent(false);
    }
  }, [value, parent]);

  return (
    <Modal
      title={disabledChooseParent ? t('Add sub folder') : t('Add folder')}
      okText={t('Add')}
      cancelText={t('Cancel')}
      visible={open}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form name="control-add" layout="vertical">
        <Form.Item
          name="folder_name"
          label={t('Folder name')}
          rules={[{ required: true }]}
        >
          <Input
            defaultValue={value}
            onChange={value => setFolderName(value.target.value)}
          />
        </Form.Item>
        {!disabledChooseParent && (
          <Form.Item name="parent" label={t('Parent Folder')}>
            {/* <FolderPickerTree setValue={setFolderParent} /> */}
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default AddDashboardFolder;
