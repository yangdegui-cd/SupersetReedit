import Form from 'antd/lib/form';
import { Button, Col, Input, Row, Space } from 'antd';
import Select from 'antd/lib/select';
import { MarkLineItem, t } from '@superset-ui/core';
// eslint-disable-next-line no-restricted-syntax
import React, { useEffect } from 'react';

export interface MarkLinePopoverProps {
  item?: MarkLineItem;
  onSave: (item: MarkLineItem) => void;
  onCancel: () => void;
  setOpen?: (open: boolean) => void;
}

export const defaultMarkLineItem: MarkLineItem = {
  name: '',
  dataIndex: 1,
  aggType: 'average',
  width: 1,
  lineType: 'solid',
  // eslint-disable-next-line theme-colors/no-literal-colors
  color: '#000000',
};

export default function MarkLinePopover({
  item,
  onSave,
  setOpen,
  onCancel,
}: MarkLinePopoverProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      ...defaultMarkLineItem,
      ...(item ?? {}),
    });
  }, [form, item]);

  const handSave = () => {
    onSave(form.getFieldsValue());
    setOpen?.(false);
  };

  return (
    <>
      <Form
        form={form}
        name="trigger"
        style={{ width: '300px' }}
        layout="vertical"
        autoComplete="off"
      >
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="辅助线名称" name="name">
              <Input
                onChange={e => form.setFieldsValue({ name: e.target.value })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="数据索引" name="dataIndex">
              <Input
                type="number"
                min={1}
                onChange={e =>
                  form.setFieldsValue({ dataIndex: Number(e.target.value) })
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="聚合类型" name="aggType">
              <Select
                onChange={value => form.setFieldsValue({ aggType: value })}
              >
                <option value="average">平均值</option>
                <option value="median">中位数</option>
                <option value="max">最大值</option>
                <option value="min">最小值</option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="辅助线宽度" name="width">
              <Input
                type="number"
                onChange={e =>
                  form.setFieldsValue({ width: Number(e.target.value) })
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="辅助线类型" name="lineType">
              <Select
                onChange={value => form.setFieldsValue({ lineType: value })}
              >
                <option value="solid">实线</option>
                <option value="dashed">虚线</option>
                <option value="dotted">斑点线</option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="辅助线颜色" name="color">
              <Input
                type="color"
                onChange={e => form.setFieldsValue({ color: e.target.value })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Space align="end" size="middle">
            <Button type="primary" onClick={onCancel}>
              {t('Cancel')}
            </Button>
            <Button type="primary" onClick={handSave}>
              {t('Save')}
            </Button>
          </Space>
        </div>
      </div>
    </>
  );
}
