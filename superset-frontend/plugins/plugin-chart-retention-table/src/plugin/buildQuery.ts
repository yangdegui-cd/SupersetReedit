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
import {buildQueryContext, QueryFormColumn,} from '@superset-ui/core';
import {RetentionTableQueryFormData} from '../types';

export default function buildQuery(formData: RetentionTableQueryFormData) {

  const columns: QueryFormColumn[] = Array.from(
    new Set([formData.dimension, formData.period])
  );
  let metrics = [formData.metric]

  if (formData.useBaseMetric) {
    metrics = Array.from(new Set([formData.metric, formData.baseMetric]))
  }

  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      orderby: [[formData.dimension, false], [formData.period, true]],
      columns,
      metrics,
    },
  ]);
}
