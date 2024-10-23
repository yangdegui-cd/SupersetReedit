export interface LineChartAuxiliaryPopoverProps {
  item?: LineChartAuxiliaryItem;
  onSave: (item: LineChartAuxiliaryItem) => void;
  onCancel: () => void;
  setOpen?: (open: boolean) => void;
}

export interface LineChartAuxiliaryItem {
  name: string;
  aggType: string;
  width: number;
  lineType: string;
  color: string;
}

export interface LineChartAuxiliaryProps {
  label: string;
  name: string;
  value: LineChartAuxiliaryItem[];
}

export interface AddAuxiliaryItemProps {
  onSave: (item: LineChartAuxiliaryItem) => any;
  handleClick: Function;
}

export interface AuxiliaryItemProps extends AddAuxiliaryItemProps {
  item: LineChartAuxiliaryItem;
  itemIndex: number;
  handelDelete: (index: number) => void;
}
