import { SupersetClient } from '@superset-ui/core';
import { DashboardFolder } from './types';

export function apiDeleteFolder(data: DashboardFolder) {
  return SupersetClient.delete({
    endpoint: `/api/v1/folder/${data.id}`,
  });
}

export function apiRenameFolder(data: DashboardFolder, name: string) {
  return SupersetClient.put({
    endpoint: `/api/v1/folder/${data.id}`,
    body: JSON.stringify({
      name,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function apiAddFolder(
  folder_name: string,
  parent_folder_id: number | undefined,
) {
  return SupersetClient.post({
    endpoint: '/api/v1/folder/',
    body: JSON.stringify({
      name: folder_name,
      parent_folder_id,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function apiSetManager(folder_id: number, user_ids: number[]) {
  return SupersetClient.put({
    endpoint: `/api/v1/folder/set_manager/${folder_id}?users=${user_ids.join(',')}`,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function apiSaveSort(treeData: any[]) {
  return SupersetClient.post({
    endpoint: '/api/v1/folder/save_sort',
    body: JSON.stringify(treeData),
    headers: { 'Content-Type': 'application/json' },
  });
}
