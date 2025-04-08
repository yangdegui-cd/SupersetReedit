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
// @ts-ignore
import {ControlPanelConfig, D3_TIME_FORMAT_OPTIONS, sharedControls} from "@superset-ui/chart-controls";
import {t, validateNonEmpty} from "@superset-ui/core";
import {PRIMARY_COLOR} from "../changeColor";


const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'dimension',
            config: {
              ...sharedControls.groupby,
              multi: false,
              validators: [validateNonEmpty],
              label: "维度",
              description: t('选择维度列'),
            },
          },
        ],
        [
          {
            name: 'period',
            config: {
              ...sharedControls.groupby,
              multi: false,
              validators: [validateNonEmpty],
              label: "阶段",
              description: t('选择阶段列'),
            },
          },
        ],
        [
          {
            name: 'metric',
            config: sharedControls.metric,
          },
        ],
        ['adhoc_filters'],
        [
          {
            name: 'row_limit',
            config: {
              ...sharedControls.row_limit,
              label: t('Cell limit'),
              description: t('Limits the number of cells that get retrieved.'),
            },
          },
        ],
        [
          {
            name: 'showRate',
            config: {
              type: 'CheckboxControl',
              label: t('Show Rate'),
              renderTrigger: true,
              default: false,
              description: t('Show total values for stacked bar chart (can be applied correctly only without composition with other charts)'),
            }
          },
        ],
      ],
    },
    {
      label: t('基准列选项'),
      expanded: true,
      tabOverride: 'data',
      controlSetRows: [
        [
          {
            name: 'useBaseMetric',
            config: {
              type: 'CheckboxControl',
              label: t('使用基准指标'),
              default: false,
              description: t('使用基准指标,计算会使用(指标/基准指标)作为留存比例, 如果不勾选此项目, 将阶段0的指标值作为基准指标'),
            }
          }
        ],
        [
          {
            name: 'baseMetric',
            config: {
              ...sharedControls.metric,
              visibility: ({form_data}: { form_data: Record<string, any> }) => !!form_data.useBaseMetric,
              validators: [],
              label: t('基准指标'),
            }
          }
        ],
        [
          {
            name: 'showBaseMetric',
            config: {
              type: 'CheckboxControl',
              label: t('显示基准指标列'),
              renderTrigger: true,
              default: false,
              description: t('图表中将基准指标列作为单独列展示'),
            }
          }
        ],
        [
          {
            name: 'fixedBaseMetric',
            config: {
              type: 'CheckboxControl',
              label: t('固定基准指标列'),
              visibility: ({form_data}: { form_data: Record<string, any> }) => !!form_data.showBaseMetric,
              renderTrigger: true,
              default: true,
              description: t('图表中展示基准指标列固定,不可滚动'),
            }
          }
        ],
        [
          {
            name: 'baseMetricLabel',
            config: {
              type: 'TextControl',
              label: t('Period 0 Label'),
              visibility: ({form_data}: { form_data: Record<string, any> }) => !!form_data.showBaseMetric,
              default: 'period0',
              description: t('图表中显示基准指标列的表头'),
            }
          }
        ],
      ]
    },
    {
      label: t('Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'periodColumnFormat',
            config: {
              type: 'TextControl',
              label: t('格式化阶段表头'),
              renderTrigger: true,
              default: '{period}',
              description: t('将阶段列的表头格式化为指定的格式, 可以使用 {period} 占位符表示阶段值'),
            }
          }
        ],
        [
          {
            name: 'valueFormat',
            config: {
              ...sharedControls.y_axis_format,
              label: t('Value format'),
            },
          },
        ],
        [
          {
            name: 'dateFormat',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Date format'),
              default: '%Y-%m-%d %a',
              renderTrigger: true,
              choices: D3_TIME_FORMAT_OPTIONS,
              description: t('D3 time format for datetime columns'),
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
        [
          {
            name: 'target_color_picker',
            config: {
              label: t('Fixed Color'),
              type: 'ColorPickerControl',
              default: PRIMARY_COLOR,
              renderTrigger: true
            }
          },
        ]
      ]
    }
  ]
}
export default config;
