import {
  DashboardFolder,
  DashboardInFolder,
  DashboardInTree,
  FolderInTree,
  FolderRootTree,
} from './types';
import { searchStrFilter } from '../../utils/searchFilterStr';

export const EMPTY_FOLDER_ROOT_TREE: FolderRootTree = {
  children: [],
  dashboards: [],
};

function buildFolderTree(
  dashboards: DashboardInFolder[],
  folders: DashboardFolder[],
): {
  children: FolderInTree[];
  dashboards: DashboardInTree[];
} {
  const folderMap: { [key: number]: FolderInTree } = {};
  const rootFolders: FolderInTree[] = [];
  const rootDashboards: DashboardInTree[] = [];
  const setFolder = (folder: DashboardFolder, dashboard?: DashboardInTree) => {
    if (!folderMap[folder.id!]) {
      folderMap[folder.id!] = {
        id: folder.id!,
        name: folder.name,
        sort_order: folder.sort_order,
        children: [],
        dashboards: [],
      };
    }
    if (dashboard) {
      folderMap[folder.id!].dashboards.push(dashboard);
    }

    // 递归查找 parent 文件夹，并将当前 folder 嵌入到正确的 parent 中
    let currentFolder = folder;
    while (currentFolder.parent) {
      const { parent } = currentFolder;

      // 如果 parent 不存在于 folderMap 中，则初始化它
      if (!folderMap[parent.id!]) {
        folderMap[parent.id!] = {
          id: parent.id!,
          name: parent.name,
          sort_order: parent.sort_order,
          children: [],
          dashboards: [],
        };
      }
      // 检查 parent 的 children 中是否已经存在该 folder
      const existingIndex = folderMap[parent.id!].children.findIndex(
        // eslint-disable-next-line no-loop-func
        child => child.id === currentFolder.id!,
      );

      if (existingIndex !== -1) {
        // 如果已经存在该 folder，则替换
        folderMap[parent.id!].children[existingIndex] =
          folderMap[currentFolder.id!];
      } else {
        // 如果不存在，则添加
        folderMap[parent.id!].children.push(folderMap[currentFolder.id!]);
      }
      // 继续往上递归，找到最顶层的 parent
      currentFolder = parent;
    }

    // 如果没有 parent，说明是顶层 folder，直接加入 rootFolders
    if (!currentFolder.parent) {
      const rootId = currentFolder.id!;
      if (!folderMap[rootId]) {
        folderMap[rootId] = {
          id: rootId,
          name: currentFolder.name,
          sort_order: currentFolder.sort_order,
          children: [],
          dashboards: [],
        };
      }

      // 如果该 folder 还没在 rootFolders 中，则添加
      const rootIndex = rootFolders.findIndex(f => f.id === rootId);
      if (rootIndex !== -1) {
        rootFolders[rootIndex] = folderMap[rootId];
      } else {
        rootFolders.push(folderMap[rootId]);
      }
    }
  };
  dashboards.forEach(dashboard => {
    const dashboardTreeItem: DashboardInTree = {
      dashboard_title: dashboard.dashboard_title,
      id: dashboard.id,
      published: dashboard.published,
      slug: dashboard.slug ?? null,
      sort_order: dashboard.sort_order,
      status: dashboard.status,
      url: dashboard.url,
    };


    // 如果 dashboard 没有 folder，直接加入 rootDashboards
    if (!dashboard.folder) {
      rootDashboards.push(dashboardTreeItem);
    } else {
      const { folder } = dashboard;
      setFolder(folder, dashboardTreeItem);
    }
  });

  folders.forEach(folder => setFolder(folder));

  // 对 folders 和 dashboards 根据 sort_order 进行排序
  function sortFoldersAndDashboards(folderTree: FolderInTree) {
    folderTree.children.sort((a, b) => a.sort_order - b.sort_order);
    folderTree.dashboards.sort((a, b) => a.sort_order - b.sort_order);
    folderTree.children.forEach(sortFoldersAndDashboards);
  }

  rootFolders.forEach(sortFoldersAndDashboards);
  rootDashboards.sort((a, b) => a.sort_order - b.sort_order);

  return { children: rootFolders, dashboards: rootDashboards };
}

export function isEmptyTree(tree: FolderRootTree) {
  return tree.children.length === 0 && tree.dashboards.length === 0;
}

export function convertDashboardsToTree(
  dashboards: DashboardInFolder[],
  folders: DashboardFolder[],
  filter: string,
): FolderRootTree {
  const filterDashboards = searchStrFilter(dashboards, filter, [
    'dashboard_title',
  ]);
  return buildFolderTree(filterDashboards, folders);
}
