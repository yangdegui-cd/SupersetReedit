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
import { t } from '@superset-ui/core';
import { ControlPanelConfig, dndAdhocMetricsControl, dndGroupByControl } from '@superset-ui/chart-controls';

const metricControl: typeof dndAdhocMetricsControl = {
  ...dndAdhocMetricsControl,
  multi: false,
  label: t('Metric'),
  description: t(
    'Select a metric to display. ' +
    'You can use an aggregation function on a column ' +
    'or write custom SQL to create a metric.',
  ),
};

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['metric'],
        [
          {
            name: 'range',
            config: {
              ...metricControl,
              label: t('范围'),
            },
          },
        ],
        [
          {
            name: 'marker',
            config: {
              ...metricControl,
              label: t('标记'),
            },
          },
        ],
        [
          {
            name: 'marker_line',
            config: {
              ...metricControl,
              label: t('标记线'),
            },
          },
        ],
        [{
          name: 'group',
          config: {
            ...dndGroupByControl,
            multi: false,
            label: t("维度")
          },
        }],
        ['adhoc_filters']],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'metric_labels',
            config: {
              type: 'TextControl',
              label: t('metric labels'),
              default: '',
              description: t('Labels for the metric'),
            },
          },
          {
            name: 'range_labels',
            config: {
              type: 'TextControl',
              label: t('Range labels'),
              default: '',
              description: t('Labels for the ranges'),
            },
          },
        ],
        [
          {
            name: 'marker_labels',
            config: {
              type: 'TextControl',
              label: t('Marker labels'),
              default: '',
              description: t('Labels for the markers'),
            },
          },
          {
            name: 'marker_line_labels',
            config: {
              type: 'TextControl',
              label: t('Marker line labels'),
              default: '',
              description: t('Labels for the marker lines'),
            },
          },
        ],
        [
          {
            name: 'showBgColor',
            config: {
              type: 'CheckboxControl',
              label: t('显示背景颜色'),
              renderTrigger: true,
              default: true,
              description: t('显示背景颜色, 通过颜色深浅区分百分比'),
            }
          }
        ],
      ],
    },
  ],
};

export default config;
