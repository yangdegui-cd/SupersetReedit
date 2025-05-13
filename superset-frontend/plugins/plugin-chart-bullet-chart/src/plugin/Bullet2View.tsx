import { BulletData } from 'react-nvd3';
import 'nvd3/build/nv.d3.css';
import { getNumberFormatter, NumberFormats } from '@superset-ui/core';
import ResponsiveAxis from './createResponsiveAxis';
import { BulletItem } from './BulletItem';
import './item.module.css';


export default function MyBulletCharts(props: any) {
  const {
    width,
    height,
    max_range,
    data,
  } = props;
  const formatter = getNumberFormatter(NumberFormats.FLOAT_2_POINT);

  // eslint-disable-next-line theme-colors/no-literal-colors
  const tips_template = (datum: any) => `
        <h3>${datum.title}</h3>
        <table>
          <tr>
            <td class="legend-color-guide">
              <svg style="width: 22px; height: 22px;" transform="translate(2,0)">
                <path  d="M0,-5 L10,0 0,5 ZM10,-10 10,10" stroke="#d62728" transform="translate(0,11)" stroke-width="1.5" fill="#d62728"></path>
              </svg>
            </td>
            <td class="key">${datum.markerLineLabels?.[0]}</td>
            <td class="value">${formatter(datum.markerLines?.[0])}</td>
          </tr>
          <tr>
            <td class="legend-color-guide">
              <svg style="width: 22px; height: 22px" transform="translate(2,0)">
                    <path d="M0,-5 L10,0 0,5 ZM10,-10 10,10" stroke="#4CC417"  transform="translate(0,11)" stroke-width="2" fill="none" stroke-dasharray="4,3"></path>
              </svg>
            </td>
            <td class="key">${datum.markerLabels?.[0]}</td>
            <td class="value">${formatter(datum.markers?.[0])}</td>
          </tr>
          <tr>
            <td class="legend-color-guide">
              <div style="background-color: #4682B4; width: 15px; height: 15px; margin: 4px 0px"></div>
            </td>
            <td class="key">${datum.measureLabels?.[0]}</td>
            <td class="value">${formatter(datum.measures?.[0])}</td>
          </tr>
          <tr>
            <td class="legend-color-guide">
              <div style="background-color: #bababa; width: 15px; height: 15px; margin: 4px 0px"></div>
            </td>
            <td class="key">${datum.rangeLabels?.[0]}</td>
            <td class="value">${formatter(datum.ranges?.[0])}</td>
          </tr>
        </table>
      `;

  return (
    <div style={{ width, height, overflowY: 'auto' }}>
      <div style={{ width, height, position: 'absolute', zIndex: 0 }}>
        <ResponsiveAxis maxValue={max_range} tickCount={5} width={width} left={120} />
      </div>
      <div style={{ width, height: height - 50, overflowY: 'auto', zIndex: 1, position: 'absolute', top: 30 }}>
        {data.map((row: BulletData) => (
          <BulletItem data={row} width={width} tips_delay={100} tips_template={tips_template} />
        ))}
      </div>
    </div>
  );
}
