import React from "react";
import { Row, Col, Button, Form, Input, Avatar } from "antd";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";

const Account = () => {
  return (
    <Row gutter={62}>
      <Col span={20}>
        <h3 className="text-16 font-semibold">Personal Details</h3>
        <Form>
          <Form.Item
            className="space-x-4"
            label="First Name"
            required
            tooltip={{
              title: "Tooltip with customize icon",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input className="" />
          </Form.Item>

          <Form.Item
            className="space-x-4"
            label="Last Name"
            required
            tooltip={{
              title: "Tooltip with customize icon",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input className="" />
          </Form.Item>

          <Form.Item
            className="space-x-4"
            label="Linked Account"
            required
            tooltip={{
              title: "Tooltip with customize icon",
              icon: <InfoCircleOutlined />,
            }}
          >
            <div className="flex items-center space-x-2">
              <Input className="" />
              <Button>Update</Button>
            </div>
          </Form.Item>
          <Form.Item
            className="space-x-4"
            label="Delete All Data"
            required
            tooltip={{
              title: "Tooltip with customize icon",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Button type="primary" danger block>
              Delete
            </Button>
          </Form.Item>
        </Form>
      </Col>
      <Col span={4}>
        <h3 className="w-16 mb-2 text-16 font-semibold text-center">Avatar</h3>
        <Avatar
          className="flex items-center justify-center"
          size={64}
          icon={<UserOutlined />}
        />
        <p className="w-16 text-[#1890FF] text-center">Edit</p>
      </Col>
    </Row>
  );
};

export default Account;
