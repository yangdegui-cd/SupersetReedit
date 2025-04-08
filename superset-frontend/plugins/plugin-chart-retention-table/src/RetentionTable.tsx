import {Table} from "antd";
// eslint-disable-next-line no-restricted-syntax
import React, {useMemo} from "react";
import {DataRecord, getColumnLabel, getMetricLabel, QueryFormMetric, styled, useTheme} from "@superset-ui/core";
import {RetentionTableProps, TableStylesProps} from "./types";
import lerpColor, {PRIMARY_COLOR} from "./changeColor";

function transformData(
  data: DataRecord[],
  dimension: string,
  period: string,
  metric: string,
  baseMetricLabel: string,
  useBaseMetric = false,
  baseMetric: QueryFormMetric,
) {
  // 创建一个映射用于存储转换后的数据
  const transformed: Record<any, any> = {};

  // 遍历原始数据
  data.forEach((item) => {
    const dimensionValue = item[dimension];
    const dimensionValueKey = dimensionValue?.toString() ?? 'null';
    const periodValue = item[period] as number;
    const metricValue = item[metric];

    // 如果这个日期的数据还没有创建，则初始化它
    if (!transformed[dimensionValueKey]) {
      transformed[dimensionValueKey] = {};
      if (useBaseMetric) {
        transformed[dimensionValueKey][baseMetricLabel] = item[getMetricLabel(baseMetric)];
      }
    }

    // 添加对应保留天数的数据
    transformed[dimensionValueKey][dimension] = dimensionValue;
    transformed[dimensionValueKey][periodValue.toString()] = metricValue;
    if (!useBaseMetric && periodValue === 0)
      transformed[dimensionValueKey][baseMetricLabel] = metricValue;
  });

  // 将映射转回数组并添加 installs 键值对
  return Object.values(transformed);
}

const Styles = styled.div<TableStylesProps>`
  ${({height, width, margin}) => `
      margin: ${margin}px;
      height: ${height - margin * 2}px;
      width: ${
    typeof width === 'string' ? parseInt(width, 10) : width - margin * 2
  }px;
 `}
`;

const RetentionTableWrapper = styled.div`
  height: 100%;
  max-width: inherit;
  overflow: auto;
`;

export default function RetentionTable(props: RetentionTableProps) {
  const {
    width,
    height,
    data,
    dimension,
    period,
    metric,
    showRate,
    showBgColor,
    periodColumnFormat = '{period}',
    dateFormatters,
    useBaseMetric,
    baseMetric,
    showBaseMetric,
    fixedBaseMetric = true,
    baseMetricLabel = 'period0',
    target_color_picker = PRIMARY_COLOR,
  } = props;
  const theme = useTheme();
  console.log(target_color_picker)
  function formatPeriod(value: string) {
    return periodColumnFormat.replace('{period}', value);
  }

  const [_columns, _data] = useMemo(() => {
        const dimension_name = getColumnLabel(dimension)
        const period_name = getColumnLabel(period)
        const metric_name = getMetricLabel(metric)
        const periods = Array.from(new Set(data.map((item: any) => item[period_name])))
        const columns = [
          {
            title: dimension_name,
            dataIndex: dimension_name,
            ellipsis: true,
            width: 150,
            fixed: true,
            className: 'dimension retention-table-call',
            render: (text: any) => {
              const lable = dateFormatters[dimension_name]?.(text) ?? text
              return <div>{lable}</div>
            }
          }, {
            title: baseMetricLabel,
            dataIndex: baseMetricLabel,
            width: 128,
            fixed: fixedBaseMetric,
            className: 'retention-table-call',
            render: (text: any) => (
              <div>{text}</div>
            )
          },
          ...periods.map((period: string) => ({
              title: formatPeriod(period),
              dataIndex: period,
              width: 128,
              className: 'period retention-table-call',
              render: (text: any, record: any) => {
                const period0 = record?.[baseMetricLabel] ?? Infinity as number
                const rate = text as number / period0 * 100
                if (!text) {
                  return <div>-</div>
                }
                if (showRate && rate) {
                  const rateLabel = rate ? `${rate.toFixed(2)}%` : ''
                  return (
                    <div style={textStyle(rate)}>
                      <p>{text}</p>
                      <p>{rateLabel}</p>
                    </div>
                  )
                }
                return (
                  <div style={textStyle(rate)}>
                    {text}
                  </div>
                )
              }
            })
          )
        ]
        if (!showBaseMetric) {
          columns.splice(1, 1)
        }
        const transform_data = transformData(data, dimension_name, period_name, metric_name, baseMetricLabel, useBaseMetric, baseMetric)
        return [columns, transform_data]
      },
      [
        dimension,
        period,
        metric,
        showRate,
        showBaseMetric,
        showBgColor,
        fixedBaseMetric,
        periodColumnFormat,
        data,
        dateFormatters,
        target_color_picker
      ]
    )
  ;

  function textStyle(rate: number) {
    if (!showBgColor) {
      return {color: 'rgb(11 17 52)'}
    }
    if (rate > 70) {
      return {
        color: 'rgb(255 255 255)',
        background: lerpColor(target_color_picker, rate)
      }
    }
    return {
      color: 'rgb(11 17 52)',
      background: lerpColor(target_color_picker, rate)
    }
  }

  return (
    <Styles height={height} width={width} margin={theme.gridUnit * 4}>
      <RetentionTableWrapper>
        <Table columns={_columns}
               style={{width: '100%', height: '100%'}}
               bordered
               sticky
               rowClassName="retention-table-row"
               size="small"
               dataSource={_data}
               pagination={false}
               scroll={{x: '100%', y: '100%'}}/>
      </RetentionTableWrapper>
    </Styles>
  )
}
