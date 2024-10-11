/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export interface DashboardInFolder {
  dashboard_title: string;
  id: number;
  published: boolean;
  slug?: string | null;
  url: string;
  status: string;
  folder?: DashboardFolder | null;
  sort_order: number;
}
export interface DashboardFolder {
  id?: number;
  name: string;
  sort_order: number;
  parent_folder_id?: number | null;
  parent?: DashboardFolder | null;
}

export interface DashboardInTree {
  dashboard_title: string;
  id: number;
  published: boolean;
  slug: string | null;
  sort_order: number;
  status: string;
  url: string;
}

export interface FolderInTree {
  id: number;
  name: string;
  sort_order: number;
  children: FolderInTree[];
  dashboards: DashboardInTree[];
}

export interface FolderRootTree {
  children: FolderInTree[];
  dashboards: DashboardInTree[];
}
