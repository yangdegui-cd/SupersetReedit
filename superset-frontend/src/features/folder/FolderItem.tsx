// eslint-disable-next-line no-restricted-syntax
import React, { useState } from 'react';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  MoreOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Dropdown, Tooltip } from 'antd-v5';
import { t } from '@superset-ui/core';
import DashboardItem from './DashboardItem';
import { DashboardFolder, DashboardInFolder, FolderInTree } from './types';
import { hasPerm } from '../../utils/permission';

interface FolderItemProps {
  data: FolderInTree;
  index?: number;
  idOrSlug: string;
  indent?: number;
  handleAddSubFolder: (data: DashboardFolder) => void;
  handleDeleteFolder: (data: DashboardFolder) => void;
  handelRenameFolder: (data: DashboardFolder) => void;
  handleDeleteDashboard: (data: DashboardInFolder) => void;
  handleEditDashboard: (data: DashboardInFolder) => void;
  handleSetManagerClick: (data: DashboardFolder) => void;
}

function FolderItem({
  data,
  index = 1,
  idOrSlug,
  indent = 20,
  handleAddSubFolder,
  handleDeleteFolder,
  handelRenameFolder,
  handleDeleteDashboard,
  handleEditDashboard,
  handleSetManagerClick,
}: FolderItemProps) {
  const padding_left = 5;
  const label_max_width = 205;
  const source = 'Folder';
  const [expand, setExpand] = useState(true);

  // eslint-disable-next-line no-underscore-dangle
  const _handleAddSubFolder = () => handleAddSubFolder(data);
  // eslint-disable-next-line no-underscore-dangle
  const _handleDeleteFolder = () => handleDeleteFolder(data);
  // eslint-disable-next-line no-underscore-dangle
  const _handelRenameFolder = () => handelRenameFolder(data);
  // eslint-disable-next-line no-underscore-dangle
  const _handleSetManagerClick = () => handleSetManagerClick(data);

  const dropdownMenu = {
    items: [
      {
        key: 'add sub folder',
        label: t('Add sub folder'),
        icon: <FolderAddOutlined />,
      },
      {
        key: 'rename',
        label: t('Rename'),
        icon: <EditOutlined />,
      },
      {
        key: 'delete folder',
        label: t('Delete folder'),
        icon: <DeleteOutlined />,
      },
      {
        key: 'set manager',
        label: t('Set manager'),
        icon: <UserSwitchOutlined />,
      },
    ],
    // eslint-disable-next-line consistent-return
    onClick: ({ key }: { key: string }) => {
      switch (key) {
        case 'add sub folder':
          return _handleAddSubFolder();
        case 'rename':
          return _handelRenameFolder();
        case 'delete folder':
          return _handleDeleteFolder();
        case 'set manager':
          return _handleSetManagerClick();
        default:
      }
    },
  };
  return (
    <div className="folder-item">
      <div
        className="folder-item-label"
        style={{ paddingLeft: `${index * indent + padding_left}px` }}
      >
        <div className="folder-item-label_wrapper">
          {expand ? <CaretDownOutlined /> : <CaretRightOutlined />}
          <span className="item-label_icon folder">
            {expand ? <FolderOpenOutlined /> : <FolderOutlined />}
          </span>
          <Tooltip title={data.name}>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <span
              onClick={() => setExpand(!expand)}
              className="item-label"
              style={{ maxWidth: `${label_max_width - index * indent}px` }}
            >
              {data.name}
            </span>
          </Tooltip>
        </div>
        {hasPerm('can_write', source) && (
          <div>
            <Dropdown menu={dropdownMenu}>
              <span className="item-label_icon add">
                <MoreOutlined />
              </span>
            </Dropdown>
          </div>
        )}
      </div>
      <div className={`folder-item-children${expand ? ' expand' : ''}`}>
        {data.children.map(sub_folder => (
          <FolderItem
            data={sub_folder}
            index={index + 1}
            idOrSlug={idOrSlug}
            handleAddSubFolder={handleAddSubFolder}
            handelRenameFolder={handelRenameFolder}
            handleDeleteDashboard={handleDeleteDashboard}
            handleSetManagerClick={handleSetManagerClick}
            handleEditDashboard={handleEditDashboard}
            handleDeleteFolder={handleDeleteFolder}
          />
        ))}
        {data.dashboards.map(db => (
          <DashboardItem
            data={db}
            index={index + 1}
            handleDeleteDashboard={handleDeleteDashboard}
            handleEditDashboard={handleEditDashboard}
            idOrSlug={idOrSlug}
          />
        ))}
      </div>
    </div>
  );
}

export default FolderItem;
