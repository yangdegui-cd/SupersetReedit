import {
  CaretRightOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
// eslint-disable-next-line no-restricted-syntax
import React from 'react';
import { Popover, Space } from 'antd-v5';
import { CustomControlConfig } from '@superset-ui/chart-controls';
import { MarkLineItem } from '@superset-ui/core';
import ControlHeader from '../../ControlHeader';
import {
  AddMarkLineItemProps,
  MarkLineControlProps,
  MarkLineItemProps,
} from './types';
import MarkLinePopover from './markLinePopover';

function LineItem({
  onSave,
  handleClick,
  item,
  itemIndex,
  handelDelete,
}: MarkLineItemProps) {
  const [open, setOpen] = React.useState(false);
  const currentHandleClick = () => {
    handleClick(itemIndex);
    setOpen(!open);
  };
  const deleteItem = (e: React.MouseEvent) => {
    handelDelete(itemIndex);
    e.stopPropagation();
  };
  return (
    <Popover
      content={() => (
        <MarkLinePopover
          onSave={item => onSave(item)}
          onCancel={() => setOpen(false)}
          setOpen={setOpen}
          item={item}
        />
      )}
      open={open}
      title="设置辅助线属性"
      trigger="click"
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="MarkLineItem" onClick={currentHandleClick}>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div className="icon" onClick={deleteItem}>
          <CloseOutlined />
        </div>
        {item.name} {item.aggType} {item.dataIndex}
        <div className="icon">
          <CaretRightOutlined className="icon" />
        </div>
      </div>
    </Popover>
  );
}

function AddLineItem({ onSave, handleClick }: AddMarkLineItemProps) {
  const [visible, setVisible] = React.useState(false);
  const handleSave = (item: MarkLineItem) => {
    onSave(item);
    setVisible(false);
  };
  const currentHandleClick = () => {
    handleClick();
    setVisible(!visible);
  };
  return (
    <Popover
      content={() => (
        <MarkLinePopover
          onSave={handleSave}
          onCancel={() => setVisible(false)}
          setOpen={setVisible}
        />
      )}
      open={visible}
      title="设置辅助线属性"
      trigger="click"
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="AddMackLineItem" onClick={currentHandleClick}>
        <PlusOutlined /> 点击添加辅助线
      </div>
    </Popover>
  );
}

export default function MarkLineControl(
  props: CustomControlConfig<MarkLineControlProps>,
) {
  const [editIndex, setEditIndex] = React.useState<number>(-1);
  const lineClick = (index = -1) => {
    setEditIndex(index);
  };
  const currentHandelDelete = (index: number) => {
    const value = [...props.value];
    value.splice(index, 1);
    props.onChange(value);
  };
  const handleSave = (item: MarkLineItem) => {
    if (editIndex >= 0 && editIndex < props.value.length) {
      const value = [...props.value];
      value[editIndex] = item;
      props.onChange(value);
    } else {
      props.onChange([...props.value, item]);
    }
    setEditIndex(-1);
  };
  return (
    <>
      <ControlHeader>{props.label}</ControlHeader>
      <div
        style={{
          padding: '4px',
          // eslint-disable-next-line theme-colors/no-literal-colors
          border: '1px solid rgb(224, 224, 224)',
          borderRadius: '4px',
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {props.value.map((item, index) => (
            <LineItem
              onSave={item => handleSave(item)}
              item={item}
              itemIndex={index}
              handelDelete={currentHandelDelete}
              handleClick={lineClick}
            />
          ))}
          <AddLineItem
            onSave={item => handleSave(item)}
            handleClick={() => lineClick()}
          />
        </Space>
      </div>
    </>
  );
}
