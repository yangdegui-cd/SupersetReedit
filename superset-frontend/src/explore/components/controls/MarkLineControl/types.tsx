import { MarkLineItem } from '@superset-ui/core';

export interface MarkLineControlProps {
  label: string;
  name: string;
  value: MarkLineItem[];
}

export interface AddMarkLineItemProps {
  onSave: (item: MarkLineItem) => any;
  handleClick: Function;
}

export interface MarkLineItemProps extends AddMarkLineItemProps {
  item: MarkLineItem;
  itemIndex: number;
  handelDelete: (index: number) => void;
}

export type MarkLineItemType = 'create' | 'edit';
