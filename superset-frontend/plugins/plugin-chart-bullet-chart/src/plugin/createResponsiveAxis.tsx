// eslint-disable-next-line no-restricted-syntax
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ResponsiveAxisProps {
  width: number;
  maxValue: number;      // X轴最大值
  tickCount: number;      // 刻度间隔（原tickInterval）
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  className?: string;
  showGrid?: boolean;    // 是否显示网格线
  tickColor?: string;    // 刻度线颜色
  lineType?: 'solid' | 'dashed' | 'dotted'; // 刻度线类型
}

const ResponsiveAxis: React.FC<ResponsiveAxisProps> = ({
  width,
  maxValue,
  tickCount,
  top = 20,
  left = 0,
  bottom = 0,
  right = 0,
  className = '',
  showGrid = true,
  tickColor = '#e0e0e0',
  lineType = 'solid',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const resizeObserverRef = useRef<ResizeObserver>();

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;


    const renderAxis = () => {
      const height = containerRef.current?.clientHeight || 0;

      // 清除旧内容
      d3.select(svgRef.current).selectAll('*').remove();

      // 创建X轴比例尺
      const xScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([left, width - right]);

      // 创建SVG组
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      const lineDash = {
        solid: '',
        dashed: '5,5',
        dotted: '2,2'
      }[lineType];

      // 添加X轴
      const xAxis = d3.axisTop(xScale)
        .ticks(tickCount)
        .tickSizeOuter(0);

      svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${top})`)
        .call(xAxis);

      // 可选：添加网格线
      if (showGrid) {
        const gridGroup =  svg.append('g')
          .attr('class', 'grid')
          .attr('transform', `translate(0, ${height - bottom})`)
          .call(d3.axisBottom(xScale)
            .ticks(tickCount)
            .tickSize(-height + top + bottom)
            .tickFormat(() => ''));

        gridGroup.selectAll('line')
          .attr('stroke', tickColor)
          .attr('stroke-opacity', 0.9)
          .attr('stroke-dasharray', lineDash);
      }
    };

    // 初始渲染
    renderAxis();

    // 设置ResizeObserver监听尺寸变化
    resizeObserverRef.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect) {
          renderAxis();
        }
      }
    });

    if (containerRef.current) {
      resizeObserverRef.current.observe(containerRef.current);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
      }
    };
  }, [maxValue, tickCount, showGrid, width]);

  return (
    <div
      ref={containerRef}
      className={`x-axis-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default ResponsiveAxis;
