// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Drawer, Space, Tooltip } from 'antd-v5';
import { DataNode } from 'antd/lib/tree';
import DirectoryTree from 'antd/lib/tree/DirectoryTree';
import { t } from '@superset-ui/core';
import {
  CaretLeftOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { DashboardInFolder, FolderInTree, FolderRootTree } from './types';
import handleResourceExport from '../../utils/export';
import { nodeDrop } from './drop-node';
import Loading from '../../components/Loading';
import ImportDashboardModal from '../../pages/FolderDashboard/sidebar/ImportDaboard';
import { apiSaveSort } from './api';
import { createErrorHandler } from '../../views/CRUD/utils';

function FolderManage({
  open,
  setOpen,
  data,
  refreshData,
  addSuccessToast,
  addDangerToast,
}: {
  open: boolean;
  setOpen: Function;
  data: FolderRootTree;
  refreshData: () => void | undefined;
  addSuccessToast: (msg: string) => void;
  addDangerToast: (msg: string) => void;
}) {
  const [_checked, _setChecked] = useState<string[]>([]);
  const [treeData, setData] = useState<DataNode[]>([]);
  const [preparingExport, setPreparingExport] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [_selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  const [selectedDashboardIds, setSelectedDashboardIds] = useState<number[]>(
    [],
  );
  const [openImportModal, setOpenImportModal] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [allKeys, setAllKeys] = useState<string[]>([]);

  useEffect(() => {
    const all_keys: string[] = [];
    const formatDashboard = (dashboard: DashboardInFolder) => {
      all_keys.push(`d_${dashboard.id}`);
      return {
        title: dashboard.dashboard_title,
        key: `d_${dashboard.id}`,
        isLeaf: true,
      };
    };
    const formatFolder = (folder: FolderInTree) => {
      all_keys.push(`f_${folder.id}`);
      const result: any = {
        key: `f_${folder.id}`,
        title: folder.name,
        children: [],
      };
      if (folder.children?.length > 0) {
        result.children = result.children ?? [];
        folder.children.forEach(sub_folder => {
          result.children.push(formatFolder(sub_folder));
        });
      }
      if (folder.dashboards?.length > 0) {
        result.children = result.children ?? [];
        folder.dashboards.forEach(dashboard => {
          result.children.push(formatDashboard(dashboard));
        });
      }
      return result;
    };
    // eslint-disable-next-line no-underscore-dangle
    const _data: DataNode[] = [];
    data.children.forEach(folder => _data.push(formatFolder(folder)));
    data.dashboards.map(dashboard => _data.push(formatDashboard(dashboard)));
    setData(_data);
    setAllKeys(all_keys);
  }, [data]);

  useEffect(() => handleSelect(allChecked ? allKeys : []), [allChecked]);

  function handleSelect(keys: any) {
    setSelectedKeys(keys);
    setSelectedDashboardIds(
      keys
        .filter((key: string) => key.startsWith('d_'))
        .map((key: string) => parseInt(key.split('_')[1], 10)),
    );
    setSelectedFolderIds(
      keys
        .filter((key: string) => key.startsWith('f_'))
        .map((key: string) => parseInt(key.split('_')[1], 10)),
    );
  }

  const handleBulkDashboardExport = () => {
    if (selectedDashboardIds.length === 0) {
      addDangerToast('请先选择要导出的dashboards');
      return;
    }
    handleResourceExport('dashboard', selectedDashboardIds, () => {
      setPreparingExport(false);
    });
    setPreparingExport(true);
  };

  function handleSaveSort() {
    console.log('selectedKeys', selectedKeys);
    apiSaveSort(treeData).then(
      () => {
        addSuccessToast('保存排序成功');
        refreshData?.();
        setOpen(false);
      },
      createErrorHandler(errMsg =>
        addDangerToast(t('An error occurred while save sort: %s', errMsg)),
      ),
    );
  }

  const handleDrop = (info: any) => {
    nodeDrop(info, treeData, setData);
  };

  const footerContent = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <Checkbox onChange={e => setAllChecked(e.target.checked)}>
          {t('All')}
        </Checkbox>
      </div>
      <Space
        style={{
          display: 'inline-flex',
          justifyContent: 'flex-end',
        }}
      >
        <Tooltip title={t('Cancel')}>
          <Button
            type="primary"
            icon={<CaretLeftOutlined />}
            ghost
            onClick={() => setOpen(false)}
          />
        </Tooltip>
        <Tooltip title={t('Delete')}>
          <Button type="primary" ghost icon={<DeleteOutlined />} />
        </Tooltip>
        <Tooltip title={t('Import')}>
          <Button
            type="primary"
            icon={<ImportOutlined />}
            ghost
            onClick={() => setOpenImportModal(true)}
          />
        </Tooltip>
        <Tooltip title={t('Export')}>
          <Button
            icon={<ExportOutlined />}
            type="primary"
            ghost
            onClick={handleBulkDashboardExport}
          />
        </Tooltip>
        <Tooltip title={t('Save sort order')}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveSort}
          />
        </Tooltip>
      </Space>
    </div>
  );

  const titleContent = (node: DataNode) => (
    <span className={node.isLeaf ? 'leaf-title' : 'folder-title'}>
      {node.title}
    </span>
  );

  return (
    <>
      <Drawer
        title="Basic Drawer"
        placement="left"
        footer={footerContent}
        onClose={() => setOpen(false)}
        open={open}
        width={500}
        zIndex={101}
      >
        <div>
          <DirectoryTree
            multiple
            checkable
            draggable
            checkedKeys={selectedKeys}
            className="custom-directory-tree"
            onDrop={handleDrop}
            titleRender={titleContent}
            defaultExpandAll
            onCheck={handleSelect}
            treeData={treeData}
          />
          {preparingExport && <Loading />}
        </div>
      </Drawer>
      <ImportDashboardModal
        open={openImportModal}
        setOpen={setOpenImportModal}
        refreshData={refreshData}
      />
    </>
  );
}

export default FolderManage;
