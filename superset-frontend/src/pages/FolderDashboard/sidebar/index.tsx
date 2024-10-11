// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useMemo, useState } from 'react';
import { SupersetClient, t } from '@superset-ui/core';
import { Alert, Button, Dropdown, Empty, Input, Space, Tooltip } from 'antd-v5';
import { MenuUnfoldOutlined, PlusSquareOutlined } from '@ant-design/icons';
import AddFolder from 'src/features/folder/AddFolder';
import { useHistory, useParams } from 'react-router-dom';
import RenameFolder from 'src/features/folder/RenameFolder';
import SetDashboardFolderManager from 'src/features/folder/SetManager';
import { useDispatch, useSelector } from 'react-redux';
import {
  DashboardFolder,
  DashboardInFolder,
  FolderRootTree,
} from '../../../features/folder/types';
import { hasPerm } from '../../../utils/permission';
import {
  convertDashboardsToTree,
  isEmptyTree,
} from '../../../features/folder/convert_dashboards';
import Loading from '../../../components/Loading';
import { apiDeleteFolder, apiRenameFolder } from '../../../features/folder/api';
import {
  addDangerToast,
  addSuccessToast,
} from '../../../components/MessageToasts/actions';
import {
  createErrorHandler,
  handleDashboardDelete,
} from '../../../views/CRUD/utils';
import DeleteModal from '../../../components/DeleteModal';
import PropertiesModal from '../../../dashboard/components/PropertiesModal';
import FolderManage from '../../../features/folder/FolderManage';
import { RootState } from '../../../views/store';
import { useChoiceProject } from '../../../features/home/ProjectPicker';
import FolderItem from '../../../features/folder/FolderItem';
import DashboardItem from '../../../features/folder/DashboardItem';

function FolderSidebar() {
  const source = 'Folder';
  const history = useHistory();
  const dispatch = useDispatch();

  const current_project = useSelector(
    (state: RootState) => state.current_project,
  );
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [dashboards, setDashboards] = useState<DashboardInFolder[]>([]);
  const [folders, setFolders] = useState<DashboardFolder[]>([]);
  const [openAddModel, setOpenAddModel] = useState(false);
  const [openFolderManage, setOpenFolderManage] = useState(false);
  const [addFolderParentId, setAddFolderParentId] = useState<
    undefined | number
  >(undefined);
  const [loadingData, setLoading] = useState(false);
  const [filterString, setFilterString] = useState('');
  const [folderToDelete, setFolderToDelete] = useState<
    DashboardFolder | undefined
  >(undefined);
  const [folderToRename, setFolderToRename] = useState<
    DashboardFolder | undefined
  >(undefined);
  const [dashboardToDelete, setDashboardToDelete] = useState<
    DashboardInFolder | undefined
  >(undefined);
  const [dashboardToEdit, setDashboardToEdit] =
    useState<DashboardInFolder | null>(null);
  const [folderToSetManager, setFolderToSetManager] = useState<
    DashboardFolder | undefined
  >(undefined);

  const handleGetList = () => {
    setLoading(true);
    SupersetClient.get({
      endpoint: '/api/v1/folder/get_list',
    })
      .then(({ json }: any) => {
        setDashboards(json.result.dashboards ?? []);
        setFolders(json.result.folders ?? []);
      })
      .finally(() => setLoading(false));
  };

  const handleGetProject = (idOrSlug: string) => {
    setLoading(true);
    SupersetClient.get({
      endpoint: `/api/v1/dashboard/${idOrSlug}`,
    })
      .then(({ json }: any) => {
        const project_id = json.result?.project?.id;
        if (project_id && project_id !== current_project) {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useChoiceProject(project_id, dispatch);
        }
      })
      .finally(() => setLoading(false));
  };

  const rootTree: FolderRootTree = useMemo(
    () => convertDashboardsToTree(dashboards, folders, filterString),
    [dashboards, folders, filterString],
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden'; // 添加样式
    // 清理函数，在组件卸载时执行
    return () => {
      document.body.style.overflow = 'auto'; // 移除样式
    };
  }, []);

  useEffect(() => handleGetList(), []);

  useEffect(() => {
    if (idOrSlug === undefined || idOrSlug === null) {
      const first = dashboards[0];
      if (first) history.push(first.url);
    }
    if (history.action === 'POP' && !!idOrSlug) {
      handleGetProject(idOrSlug);
    }
  }, [idOrSlug, dashboards]);

  function handleAddSubFolder(data: DashboardFolder) {
    setAddFolderParentId(data.id);
    setOpenAddModel(true);
  }
  const handleFilterChange = (e: any) => setFilterString(e.target.value);
  const handleDeleteFolderClick = (data: DashboardFolder) =>
    setFolderToDelete(data);
  const handleDeleteDashboardClick = (data: DashboardInFolder) =>
    setDashboardToDelete(data);
  const handleEditDashboardClick = (data: DashboardInFolder) =>
    setDashboardToEdit(data);
  const handleRenameFolderClick = (data: DashboardFolder) =>
    setFolderToRename(data);
  const handleSetManagerClick = (data: DashboardFolder) =>
    setFolderToSetManager(data);

  const handleRenameFolder = (new_name: string) => {
    // eslint-disable-next-line no-unused-expressions
    folderToRename &&
      apiRenameFolder(folderToRename, new_name)
        .then(
          () => {
            addSuccessToast(t('rename folder success'));
            handleGetList();
          },
          createErrorHandler(errMsg =>
            addDangerToast(
              t('An error occurred while rename dashboard folder: %s', errMsg),
            ),
          ),
        )
        .finally(() => setFolderToRename(undefined));
  };
  const handleDeleteFolder = () => {
    // eslint-disable-next-line no-unused-expressions
    folderToDelete &&
      apiDeleteFolder(folderToDelete)
        .then(
          () => {
            addSuccessToast(t('delete folder success'));
            handleGetList();
          },
          createErrorHandler(errMsg =>
            addDangerToast(
              t(
                'An error occurred while deleting dashboard folder: %s',
                errMsg,
              ),
            ),
          ),
        )
        .finally(() => setFolderToDelete(undefined));
  };

  const SidebarHeader = () => {
    const dropdown_menu_items = [
      {
        key: 'add_folder',
        label: t('Add folder'),
      },
      {
        key: 'add_dashboard',
        label: t('Add Dashboard'),
      },
    ];
    const dropdown_menu_onclick = ({ key }: { key: string }) => {
      switch (key) {
        case 'add_folder':
          setOpenAddModel(true);
          break;
        case 'add_dashboard':
          window.location.assign('/dashboard/new');
          break;
        default:
          break;
      }
    };
    return (
      <div className="dashboard-sider-header">
        <Input
          defaultValue={filterString}
          placeholder={t('按下回车键搜索')}
          onPressEnter={handleFilterChange}
        />
        {hasPerm('can_write', source) && (
          <div>
            <Tooltip title={t('Dashboard manager')}>
              <Button
                type="primary"
                icon={<MenuUnfoldOutlined />}
                ghost
                onClick={() => setOpenFolderManage(true)}
              />
            </Tooltip>
            <Dropdown
              menu={{
                items: dropdown_menu_items,
                onClick: dropdown_menu_onclick,
              }}
            >
              <Button
                type="primary"
                style={{ marginLeft: '10px' }}
                icon={<PlusSquareOutlined />}
              />
            </Dropdown>
          </div>
        )}
      </div>
    );
  };

  const PopUpBox = () => {
    if (hasPerm('can_write', source)) {
      return (
        <>
          <AddFolder
            open={openAddModel}
            setOpen={setOpenAddModel}
            parent={addFolderParentId}
            onSaved={() => {
              handleGetList();
              setAddFolderParentId(undefined);
            }}
            onCanceled={() => setAddFolderParentId(undefined)}
          />
          <RenameFolder
            open={!!folderToRename}
            value={folderToRename?.name}
            onSaved={new_name => handleRenameFolder(new_name)}
            onCanceled={() => setFolderToRename(undefined)}
          />
          <DeleteModal
            description={
              <>
                {t('Are you sure you want to delete')}{' '}
                <b>{folderToDelete?.name}</b>?
                <Alert
                  message={t(
                    'When you delete a folder, all the subfolders within it will be removed, but the boards within the folder will not be deleted. The boards from the original folder will be moved to the root directory.',
                  )}
                  style={{ marginTop: '10px' }}
                  type="warning"
                />
              </>
            }
            onConfirm={() => handleDeleteFolder()}
            onHide={() => setFolderToDelete(undefined)}
            open={!!folderToDelete}
            title={t('Please confirm')}
          />
          {dashboardToEdit && (
            <PropertiesModal
              dashboardId={dashboardToEdit.id}
              show
              onHide={() => setDashboardToEdit(null)}
            />
          )}
          {dashboardToDelete && (
            <DeleteModal
              description={
                <>
                  {t('Are you sure you want to delete')}{' '}
                  <b>{dashboardToDelete.dashboard_title}</b>?
                </>
              }
              onConfirm={() => {
                handleDashboardDelete(
                  dashboardToDelete as any,
                  handleGetList,
                  addSuccessToast,
                  addDangerToast,
                  undefined,
                ).then(() => {
                  setDashboardToDelete(undefined);
                });
              }}
              onHide={() => setDashboardToDelete(undefined)}
              open={!!dashboardToDelete}
              title={t('Please confirm')}
            />
          )}
          {folderToSetManager && (
            <SetDashboardFolderManager
              open={!!folderToSetManager}
              data={folderToSetManager}
              onCanceled={() => setFolderToSetManager(undefined)}
              onSaved={() => {
                setFolderToSetManager(undefined);
                handleGetList();
              }}
            />
          )}
          <FolderManage
            data={rootTree}
            open={openFolderManage}
            addSuccessToast={addSuccessToast}
            refreshData={handleGetList}
            addDangerToast={addDangerToast}
            setOpen={setOpenFolderManage}
          />
        </>
      );
    }
    return <></>;
  };

  return (
    <div className="dashboard-sider">
      <PopUpBox />
      <SidebarHeader />
      <div className="dashboard-sider-menus">
        {!loadingData &&
          rootTree.children.map(folder => (
            <FolderItem
              data={folder}
              index={0}
              idOrSlug={idOrSlug}
              handleAddSubFolder={handleAddSubFolder}
              handleDeleteFolder={handleDeleteFolderClick}
              handelRenameFolder={handleRenameFolderClick}
              handleSetManagerClick={handleSetManagerClick}
              handleDeleteDashboard={handleDeleteDashboardClick}
              handleEditDashboard={handleEditDashboardClick}
            />
          ))}
        {!loadingData &&
          rootTree.dashboards.map(dashboard => (
            <DashboardItem
              data={dashboard}
              index={0}
              handleDeleteDashboard={handleDeleteDashboardClick}
              handleEditDashboard={handleEditDashboardClick}
              idOrSlug={idOrSlug}
            />
          ))}
        {loadingData && <Loading />}
        {isEmptyTree(rootTree) && (
          <Empty className="mt-[10px]" description={<span>暂无看板</span>}>
            <Space>
              <Button
                type="primary"
                onClick={() => window.location.assign('/dashboard/new')}
              >
                {t('Add Dashboard')}
              </Button>
              <Button type="primary" onClick={() => setOpenAddModel(true)}>
                {t('Add folder')}
              </Button>
            </Space>
          </Empty>
        )}
      </div>
    </div>
  );
}

export default FolderSidebar;
