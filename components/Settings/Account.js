import React, {useState, useEffect} from "react";
import { Row, Col, Button, Form, Input, Avatar } from "antd";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import {useAuth} from "../../contexts/AuthContext"

const Account = () => {
  const {user} = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if(user) {
      setName(user.displayName)
      setEmail(user.email)
    }
  }, [user])

  return (
    <Row gutter={62}>
      <Col span={20}>
        <h3 className="text-16 font-semibold">Personal Details</h3>
        <Form
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 24,
          }}
        >
          <Form.Item
            className="space-x-4"
            label="Full Name"
            required
            tooltip={{
              title: "Tooltip with customize icon",
              icon: <InfoCircleOutlined />,
            }}
          >
            <Input
              className=""
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
              <Input
                className=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
          src={user?.photoURL}
          size={64}
          icon={<UserOutlined />}
        />
        <p className="w-16 text-[#1890FF] text-center">Edit</p>
      </Col>
    </Row>
  );
};

export default Account;
