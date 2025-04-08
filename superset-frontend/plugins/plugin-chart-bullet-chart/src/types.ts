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
import {
  DataRecord,
  DataRecordValue,
  NumberFormatter,
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
  TimeFormatter,
} from '@superset-ui/core';

export interface TableStylesProps {
  height: number;
  width: number | string;
  margin: number;
}

export type FilterType = Record<string, DataRecordValue>;
export type SelectedFiltersType = Record<string, DataRecordValue[]>;

export type DateFormatter =
  | TimeFormatter
  | NumberFormatter
  | ((value: DataRecordValue) => string);

export enum MetricsLayoutEnum {
  ROWS = 'ROWS',
  COLUMNS = 'COLUMNS',
}

interface RetentionTableQueryProps {
  dimension: QueryFormColumn;
  period: QueryFormColumn;
  metric: QueryFormMetric;
  showRate: boolean;
  showBgColor: boolean;
  emitCrossFilters?: boolean;
  selectedFilters?: SelectedFiltersType;
  periodColumnFormat: string;
  valueFormat: string;
  dateFormat: DateFormatter;
  dateFormatters: Record<string, DateFormatter | undefined>;
  useBaseMetric: boolean;
  baseMetric: QueryFormMetric;
  showBaseMetric: boolean;
  fixedBaseMetric: boolean;
  baseMetricLabel: string;
  target_color_picker: {
    r: number
    g: number
    b: number
    a?: number
  };
}

export type RetentionTableQueryFormData = QueryFormData &
  TableStylesProps &
  RetentionTableQueryProps;

export type RetentionTableProps = TableStylesProps &
  RetentionTableQueryProps & {
  data: DataRecord[];
};
