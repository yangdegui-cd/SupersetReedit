import { BulletData } from 'react-nvd3';

export interface BulletItemProps {
  data: BulletData;
  height?: number;
  width: number;
  label_width?: number;
  tips_delay?: number;
  tips_template: (d: any) => string;
}
