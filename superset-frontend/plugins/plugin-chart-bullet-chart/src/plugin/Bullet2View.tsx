import * as d3 from 'd3';
import * as nv from 'nvd3';
import { useEffect, useRef } from 'react';
import { BulletChartProps, BulletData } from 'react-nvd3';
import 'nvd3/build/nv.d3.css';
import ResponsiveAxis from './createResponsiveAxis';


const BulletChart: (props: BulletChartProps) => JSX.Element = (props: BulletChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { width } = props;
  useEffect(() => {
    if (!chartRef.current) return;
    const {
      datum,
      showBgColor = true,
    } = props;
    // 清除现有内容
    d3.select(chartRef.current).selectAll('*').remove();

    // 创建图表
    nv.addGraph(() => {
      const chart = nv.models.bulletChart();
      chart.height(30)
      chart.margin({ left: 120, right: 0, bottom: 0 });
      chart.tooltip.enabled(true);
      chart.tooltip.contentGenerator(function(d) {
        return `
        <h3>${datum.title}</h3>
        <table>
          <tr>
            <td class="legend-color-guide">
              <div style="background-color: #4682B4; width: 15px; height: 15px; margin: 4px 0px"></div>
            </td>
            <td class="key">${datum.measureLabels ?? [0]}</td>
            <td class="value">${datum.measures[0]}</td>
          </tr>
          <tr>
            <td class="legend-color-guide">
              <svg style="width: 22px; height: 22px">
                <path 
                class="nv-markerTriangle" 
                d="M0,5L5,-5 -5,-5Z" 
                transform="translate(7,15)"
                style="stroke: #000;fill: #fff; stroke-width: 1.5px;"
                />
              </svg>
            </td>
            <td class="key">${datum.markerLabels ?? [0]}</td>
            <td class="value">${datum.markers ?? [0]}</td>
          </tr>
          <tr>
            <td class="legend-color-guide">
              <svg style="width: 22px; height: 22px;" transform="translate(2,0)">
                <line x1="0" y1="0" x2="0" y2="22" stroke="#c00" stroke-width="2"/>
                <path d="M0,0 L8,8 L0,16 Z" fill="#c00"/>
              </svg>
            </td>
            <td class="key">${datum.markerLineLabels ?? [0]}</td>
            <td class="value">${datum.markerLines ?? [0]}</td>
          </tr>
          <tr>
            <td class="legend-color-guide">
              <div style="background-color: #bababa; width: 15px; height: 15px; margin: 4px 0px"></div>
            </td>
            <td class="key">${datum.rangeLabels ?? [0]}</td>
            <td class="value">${datum.ranges[0]}</td>
          </tr>
        </table>
      `;
      });
      chart.tooltip.duration(0)
      chart.tooltip.hideDelay(0)

      d3.select(chartRef.current)
        .append('svg')
        .datum(datum)
        .attr('width', width ?? '100%')
        // @ts-ignore
        .call(chart);
      d3.select(chartRef.current).selectAll('g.nv-tick text')
        .remove();
      d3.select(chartRef.current).select('.nv-rangeAvg')
        .style('fill-opacity', 1);
      d3.select(chartRef.current).select('.nv-measure')
        .attr("height", 17)
        .attr('y', 4)

      if(!showBgColor){
        d3.select(chartRef.current).select('.nv-rangeMax').style('fill-opacity', 0);
      }else{
        d3.select(chartRef.current).select('.nv-rangeMax').style('fill-opacity', 0.1);
      }
      d3.select(chartRef.current).selectAll<SVGLineElement, unknown>('.nv-markerLine').each(function() {
        const markerLine = d3.select(this);
        const parentNode = this.parentNode;

        // 类型安全验证
        if (!parentNode || parentNode.nodeName !== 'g') return;

        const parent = d3.select(parentNode as SVGGElement);
        const x = Number(markerLine.attr('x1')) || 0;
        const y = Number(markerLine.attr('y1')) || 0;

        parent.append('g')
          .attr('transform', `translate(${x}, ${y})`)
          .html(`
          <line x1="0" y1="0" x2="0" y2="28" stroke="#c00" stroke-width="2"/>
          <path d="M0,0 L8,8 L0,16 Z" fill="#c00"/>
        `);
        markerLine.style('stroke-opacity', 0);
      });

      return chart;
    });

  }, [props]);
  return <div ref={chartRef} style={{ width, height: '30px' }} />;
};


export default function MyBulletCharts(props: any) {
  const {
    width,
    height,
    max_range,
    data,
    showBgColor
  } = props;

  return (
    <div style={{ width, height, overflowY: 'auto' }}>
      <div style={{ width, height, position: 'absolute', zIndex: 0 }}>
        <ResponsiveAxis maxValue={max_range} tickCount={10} width={width} left={120}/>
      </div>
      <div style={{ width, height: height - 50, overflowY: 'auto', zIndex: 1, position: 'absolute', top: 30 }}>
        {data.map((row: BulletData) => (
          <BulletChart width={width} datum={row} showBgColor={showBgColor} />
        ))}
      </div>
    </div>
  );
}
