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
import { ChartProps, getColumnLabel, getMetricLabel, QueryFormData } from '@superset-ui/core';
// eslint-disable-next-line lodash/import-scope,import/no-extraneous-dependencies
import _ from 'lodash';


export default function transformProps(chartProps: ChartProps<QueryFormData>) {
  /**
   * This function is called after a successful response has been
   * received from the chart data endpoint, and is used to transform
   * the incoming data prior to being sent to the Visualization.
   *
   * The transformProps function is also quite useful to return
   * additional/modified props to your data viz component. The formData
   * can also be accessed from your PivotTableChart.tsx file, but
   * doing supplying custom props here is often handy for integrating third
   * party libraries that rely on specific props.
   *
   * A description of properties in `chartProps`:
   * - `height`, `width`: the height/width of the DOM element in which
   *   the chart is located
   * - `formData`: the chart data request payload that was sent to the
   *   backend.
   * - `queriesData`: the chart data response payload that was received
   *   from the backend. Some notable properties of `queriesData`:
   *   - `data`: an array with data, each row with an object mapping
   *     the column/alias to its value. Example:
   *     `[{ col1: 'abc', metric1: 10 }, { col1: 'xyz', metric1: 20 }]`
   *   - `rowcount`: the number of rows in `data`
   *   - `query`: the query that was issued.
   *
   * Please note: the transformProps function gets cached when the
   * application loads. When making changes to the `transformProps`
   * function during development with hot reloading, changes won't
   * be seen until restarting the development server.
   */
  const {
    width,
    height,
    queriesData,
    formData,
    hooks: {
      setDataMask = () => {
      }, onContextMenu,
    },
    filterState,
    datasource: { verboseMap = {}, columnFormats = {}, currencyFormats = {} },
    emitCrossFilters,
  } = chartProps;
  const { data } = queriesData[0];
  const {
    group,
    metric,
    range,
    marker,
    markerLine,
    metricLabels,
    rangeLabels,
    markerLabels,
    markerLineLabels,
    showBgColor,
  } = formData;

  function customRoundMath(number: number): number {
    if (number === 0) return 0;

    // 计算数字的数量级
    const magnitude = Math.floor(Math.log10(number));
    const power = Math.pow(10, magnitude);

    // 获取第一位数字
    const firstDigit = Math.floor(number / power);

    // 获取第二位数字（如果存在）
    let secondDigit = 0;
    if (magnitude >= 1) {
      secondDigit = Math.floor((number % power) / (power / 10)) + 1;
    }

    // 构建结果
    if (magnitude >= 1) {
      return (firstDigit * 10 + secondDigit) * (power / 10);
    }
    return (firstDigit + 1) * 1;
  }

  const { selectedFilters } = filterState;
  const max = _.max(data.map((row: any) => (row[getMetricLabel(range)])));
  const max_range = customRoundMath(max as number)
  // eslint-disable-next-line no-underscore-dangle
  const _data = data.map((row: any) => ({
    ranges: [row[getMetricLabel(range)], max_range],
    title: row[getColumnLabel(group)],
    measures: [row[getMetricLabel(metric)]],
    markers: [row[getMetricLabel(marker)]],
    markerLines: [row[getMetricLabel(markerLine)]],
    measureLabels: [_.isEmpty(metricLabels) ?  getMetricLabel(metric) : metricLabels],
    rangeLabels: [_.isEmpty(rangeLabels) ?  getMetricLabel(range) : rangeLabels],
    markerLabels: [_.isEmpty(markerLabels) ?  getMetricLabel(marker) : markerLabels],
    markerLineLabels: [_.isEmpty(markerLineLabels) ? getMetricLabel(markerLine) : markerLineLabels]
  }));

  return {
    width,
    height,
    data: _data,
    max_range,
    group,
    metric,
    marker,
    markerLine,
    metricLabels,
    rangeLabels,
    markerLabels,
    markerLineLabels,
    emitCrossFilters,
    setDataMask,
    selectedFilters,
    verboseMap,
    columnFormats,
    currencyFormats,
    onContextMenu,
    showBgColor
  };
}
