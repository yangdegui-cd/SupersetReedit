import React, { useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { Dropdown, Tooltip } from 'antd-v5';
import { t } from '@superset-ui/core';
import { DashboardInFolder, DashboardInTree } from './types';
import { hasPerm } from '../../utils/permission';

interface DashboardItemProps {
  data: DashboardInTree;
  index: number;
  idOrSlug: string;
  indent?: number;
  handleDeleteDashboard: (data: DashboardInFolder) => void;
  handleEditDashboard: (data: DashboardInFolder) => void;
}

export default function DashboardItem({
  data,
  index = 0,
  indent = 20,
  idOrSlug,
  handleDeleteDashboard,
  handleEditDashboard,
}: DashboardItemProps) {
  const padding_left = 5;
  const expand_icon_width = 20;
  const label_max_width = 205;
  const source = 'Folder';

  const label_item_style = {
    paddingLeft: `${index * indent + padding_left + expand_icon_width}px`,
  };
  const label_span_style = {
    maxWidth: `${label_max_width - index * indent}px`,
  };

  const [active, setActive] = useState(false);
  const history = useHistory();
  const dropdownMenu = {
    items: [
      {
        key: 'add_dashboard',
        label: t('Edit Dashboard'),
        icon: <EditOutlined />,
      },
      {
        key: 'delete_dashboard',
        label: t('DELETE'),
        icon: <DeleteOutlined />,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      switch (key) {
        case 'add_dashboard':
          return handleEditDashboard(data);
        case 'delete_dashboard':
          return handleDeleteDashboard(data);
      }
    },
  };
  useEffect(() => {
    setActive(idOrSlug === data.id.toString() || idOrSlug === data.slug);
  }, [idOrSlug, data]);
  return (
    <a
      className={`dashboard-item${active ? ' active' : ''}`}
      href={data.url}
      onClick={e => e.preventDefault()}
    >
      <div className="dashboard-item-label" style={label_item_style}>
        <div
          className="folder-item-label_wrapper"
          onClick={() => history.push(data.url)}
        >
          <span className="item-label_icon dashboard">
            <FileTextOutlined />
          </span>
          <Tooltip title={data.dashboard_title}>
            <span className="item-label" style={label_span_style}>
              {data.dashboard_title}
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
    </a>
  );
}
