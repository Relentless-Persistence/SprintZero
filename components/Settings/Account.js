import React from 'react';
import { Button, Form, Input } from 'antd';
import { InfoCircleOutlined } from "@ant-design/icons";

const Account = () => {
  return (
    <div className="w-[90%] flex items-center justify-between">
      <div className="w-full">
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
            <Button type='primary' danger block>Delete</Button>
          </Form.Item>
        </Form>
      </div>
      <div>
        <h3 className="text-16 font-semibold">Avatar</h3>
      </div>
    </div>
  );
}

export default Account;
