import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { styled } from '@superset-ui/core';
import { BulletItemProps } from '../types/type';

// eslint-disable-next-line theme-colors/no-literal-colors
const TipsTemplate = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  pointer-events: none;

  h3 {
    margin: 0;
    padding: 4px 14px;
    line-height: 18px;
    font-weight: normal;
    background-color: rgba(247, 247, 247, 0.75);
    color: rgba(0, 0, 0, 1.0);
    text-align: center;
    border-bottom: 1px solid #ebebeb;
    border-radius: 5px 5px 0 0;
  }

  td {
    padding: 2px 9px 2px 0;
    vertical-align: middle;
    font-size: 12px !important;
  }

  td.key {
    font-weight: normal;
  }

  td.value {
    text-align: right;
    font-weight: bold;
  }
`;

export const BulletItem = (props: BulletItemProps) => {

  const { data, height = 25, width, label_width = 120, tips_delay = 0, tips_template } = props;

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateTooltipPosition = (mouseX: number, mouseY: number) => {
    let x = mouseX + 10;
    let y = mouseY;
    if (isVisible && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // 检查右侧是否会超出视窗
      if (mouseX + tooltipRect.width > window.innerWidth) {
        x = mouseX - tooltipRect.width - 10;
      }

      // 检查底部是否会超出视窗
      if (mouseY + tooltipRect.height / 2 > window.innerHeight) {
        y = window.innerHeight - tooltipRect.height - 10;
      // 检查头部是否会超出视窗
      }else if (mouseY < tooltipRect.height / 2) {
        y =  10;
      // 默认居中显示
      }else {
        y = mouseY - tooltipRect.height / 2;
      }
    }
    setPosition({
      x,
      y,
    });
  };

  const handleMouseEnter = () => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 实时更新鼠标位置
    updateTooltipPosition(e.clientX, e.clientY);

    // 如果还没显示，设置延迟显示
    if (!isVisible && !timerRef.current) {
      timerRef.current = setTimeout(() => {
        setIsVisible(true);
      }, tips_delay);
    }
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  console.log(data);

  return (
    <div style={{ width, height, fontSize: '14px', position: 'relative', marginBottom: '10px' }} key={data.title}>
      <div className="label" style={{
        width: label_width,
        height,
        position: 'absolute',
        left: 0,
        top: 0,
        // eslint-disable-next-line theme-colors/no-literal-colors
        color: '#000000',
      }}>{data.title}</div>
      <svg style={{ width: width - label_width, height, position: 'absolute', left: label_width, top: 0 }}
           onMouseEnter={handleMouseEnter}
           onMouseMove={handleMouseMove}
           onMouseLeave={handleMouseLeave}>
        <g>
          <rect height={height}
                x="0"
                fill="#bababa"
                width={(width - label_width) * 1.0 * data.ranges[0] / data.ranges[1]}
                style={{ fillOpacity: 1 }} />
          <rect height={height - 4 * 2}
                y="4"
                fill="#1F77B4FF"
                style={{ fillOpacity: 0.8 }}
                x="0"
                width={(width - label_width) * 1.0 * data.measures[0] / data.ranges[1]} />
          {data.markers &&
            <path className="nv-markerTriangle"
                  d="M-10,-5 L0,0 -10,5 ZM0,-10 0,10"
                  transform={`translate(${(width - label_width) * 1.0 * data.markers[0] / data.ranges[1]},12.5)`}
                  stroke="rgb(76, 196, 23)"
                  fill="#fff"
                  stroke-width="2px"
                  stroke-dasharray="4.3" />}
          {data.markerLines &&
            <path transform={`translate(${(width - label_width) * 1.0 * data.markerLines[0] / data.ranges[1]},12.5)`}
                  d="M-10,-5 L0,0 -10,5 ZM0,-10 0,10"
                  stroke="#d62728"
                  stroke-width="1.5"
                  fill="#d62728" />}
        </g>
      </svg>

      {isVisible &&
        createPortal(
          <TipsTemplate
            ref={tooltipRef}
            style={{
              transform: `translate(${position.x}px,${position.y}px)`,
            }}
            dangerouslySetInnerHTML={{ __html: tips_template(data) }}
          />,
          document.body,
        )}
    </div>
  );
};
