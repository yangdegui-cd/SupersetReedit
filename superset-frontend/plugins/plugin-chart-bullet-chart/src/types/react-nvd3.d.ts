// types/react-nvd3.d.ts
declare module 'react-nvd3' {
  import { Component } from 'react';

  interface BulletData {
    title: string;       // 图表标题
    subtitle?: string;   // 副标题
    ranges: number[];   // 范围背景值 (通常3个)
    measures: number[]; // 实际值 (通常1-2个)
    markers?: number[]; // 标记线 (通常1个)
    markerLines?: number[];
    markerLabels?: string[],
    markerLineLabels?: string[],
    rangeLabels?: string[],
    measureLabels?: string[]
  }

  interface BulletChartProps {
    datum: BulletData;
    height?: number;
    width?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    color?: string | string[];
    orient?: 'left' | 'right' | 'top' | 'bottom';
    duration?: number;
    [key: string]: any;
    showBgColor?: boolean;
  }

  export class BulletChart extends Component<BulletChartProps> {}
  // 保留其他图表类型的定义...
}
