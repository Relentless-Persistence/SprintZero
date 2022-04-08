import React, { useState } from "react";
import { Card, Space, Button, Form, Input, Row, Col, Drawer, Radio, DatePicker, TimePicker, Switch } from "antd";
import {
  DeleteOutlined,
  HourglassOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";

const Share = ({ addPerson, setAddPerson }) => {
  return (
    <div id="billings">
      <div className="mb-[42px]">
        <h3 className="font-semibold text-16 mb-3">Active</h3>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p>Theresa Webb</p>
              <p>twebb@example.com</p>
            </div>
            <Space>
              <Button
                className="flex items-center"
                icon={<HourglassOutlined />}
              >
                Unlimited
              </Button>
              <Button className="flex items-center" icon={<DeleteOutlined />}>
                Remove
              </Button>
            </Space>
          </div>
        </Card>
        <Card className="mt-[9px]">
          <div className="flex items-center justify-between">
            <div>
              <p>Theresa Webb</p>
              <p>twebb@example.com</p>
            </div>
            <Space>
              <Button
                className="flex items-center"
                icon={<HourglassOutlined />}
              >
                12 Days left
              </Button>
              <Button className="flex items-center" icon={<DeleteOutlined />}>
                Remove
              </Button>
            </Space>
          </div>
        </Card>
      </div>
      <div>
        <h3 className="font-semibold text-16 mb-3">Inactive</h3>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p>Theresa Webb</p>
              <p>twebb@example.com</p>
            </div>
            <Space>
              <Button
                className="flex items-center"
                icon={<HourglassOutlined />}
                danger
                ghost
              >
                Expired
              </Button>
              <Button className="flex items-center" icon={<PoweroffOutlined />}>
                Reactivate
              </Button>
            </Space>
          </div>
        </Card>
      </div>

      <Drawer
        visible={addPerson}
        closable={false}
        placement={"bottom"}
        title={<h3 className="font-semibold text-20">Viewer</h3>}
        extra={
          <Space>
            <Button danger ghost onClick={() => setAddPerson(false)}>
              Cancel
            </Button>
            <Button type="primary" danger onClick={() => setAddPerson(false)}>
              Done
            </Button>
          </Space>
        }
      >
        <Form layout="vertical">
          <Row gutter={48}>
            <Col span={8}>
              <Form.Item label={<p className="font-semibold text-20">Name</p>}>
                <Input />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold text-20">Email address</p>}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold text-20">Designation</p>}
              >
                <Radio.Group
                  options={[
                    { label: "Internal", value: "Internal" },
                    { label: "External", value: "External" },
                  ]}
                  value={"Internal"}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <p className="font-semibold text-20 mb-[6px]">Time Limit</p>
              <div className="mb-[18px]">
                <p className="mb-[10px] text-16 font-semibold">Start</p>
                <DatePicker
                  className="mr-3"
                  // defaultValue={moment("2015/01/01", "YYYY-MM-DD")}
                  format={"YYYY-MM-DD"}
                />
                <TimePicker
                // onChange={onChange}
                // defaultOpenValue={moment("00:00:00", "HH:mm:ss")}
                />
              </div>
              <div className="mb-[18px]">
                <p className="mb-[10px] text-16 font-semibold">End</p>
                <DatePicker
                  className="mr-3"
                  // defaultValue={moment("2015/01/01", "YYYY-MM-DD")}
                  format={"YYYY-MM-DD"}
                />
                <TimePicker
                // onChange={onChange}
                // defaultOpenValue={moment("00:00:00", "HH:mm:ss")}
                />
              </div>
            </Col>
            <Col span={8}>
              <p className="font-semibold text-20 mb-[11px]">
                Section Limitations
              </p>
              <Space direction="vertical">
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked className="bg-[#4A801D]" />
                  <p>Strategy</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked className="bg-[#4A801D]" />
                  <p>Tactics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked className="bg-[#4A801D]" />
                  <p>Operations</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked className="bg-[#4A801D]" />
                  <p>Userbase</p>
                </div>
              </Space>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default Share;
