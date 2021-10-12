import React, { useState, useEffect } from 'react'
import { useRouter } from "next/router";
import { Typography, Card, Row, Col, Button, Input, Form, Select, Divider, Checkbox } from "antd";
import {QuestionCircleOutlined} from '@ant-design/icons';

const { Title, Text } = Typography;
const {Item} = Form;
const { Option } = Select;

const Billing = ({selectedPlan, countries}) => {
  const router = useRouter();

  return (
    selectedPlan && (
      <>
        <div className="mb-4">
          <Title level={2}>Hand Over Those Deets</Title>
          <Text>
            Please provide your information below so we can keep our internet
            service providers happy and continue to evolve this product
          </Text>
        </div>

        <div>
          <Text className="text-sm text-gray-500 font-semibold">
            Contact Information
          </Text>
          <Row gutter={[16, 16]} className="mt-4">
            <Col sm={24} lg={14}>
              <Item
                label={
                  <Text className="flex items-center justify-between text-xs">
                    Full Name <QuestionCircleOutlined className="ml-2" />
                  </Text>
                }
                name="fullName"
                rules={[
                  {
                    required: true,
                    message: "Please input your full name!",
                  },
                ]}
              >
                <div className="flex">
                  <Input placeholder="First" />
                  <Input className="ml-2" placeholder="Last" />
                </div>
              </Item>
            </Col>

            <Col sm={24} lg={10}>
              <Item
                label={
                  <Text className="flex items-center justify-between text-xs">
                    Email <QuestionCircleOutlined className="ml-2" />
                  </Text>
                }
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                  },
                ]}
              >
                <Input />
              </Item>
            </Col>
          </Row>
        </div>

        <div>
          <Text className="text-sm text-gray-500 font-semibold">
            Credit Card Details
          </Text>
          <Row gutter={[16, 16]} className="mt-4">
            <Col sm={24} lg={12}>
              <Item
                label={
                  <Text className="flex items-center justify-between text-xs">
                    Country <QuestionCircleOutlined className="ml-2" />
                  </Text>
                }
                name="country"
                rules={[
                  {
                    required: true,
                    message: "Please input your full name!",
                  },
                ]}
              >
                <div className="flex">
                  <Select defaultValue="United States" style={{ width: "90%" }}>
                    {countries.map((country, i) => (
                      <Option key={i} value={country.name}>
                        {country.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Item>
            </Col>

            <Col sm={24} lg={12}>
              <Item
                label={
                  <Text className="flex items-center justify-between text-xs">
                    ZIP/Postal Code <QuestionCircleOutlined className="ml-2" />
                  </Text>
                }
                name="zip"
                rules={[
                  {
                    required: true,
                    message: "Please input your zip/postal code",
                  },
                ]}
              >
                <Input />
              </Item>
            </Col>
          </Row>
        </div>

        <div>
          <Text className="text-sm text-gray-500 font-semibold">
            Selected Plan
          </Text>
          <Col className="flex items-center justify-between">
            <Text className="text-xl">{selectedPlan.plan}</Text>
            <Text className="text-xl">${selectedPlan.price} USD</Text>
          </Col>
          <Col className="flex items-center justify-between mt-4">
            <Text className="text-xl">Sales Tax</Text>
            <Text className="text-xl">$0.00 USD</Text>
          </Col>
          <Divider className="bg-gray-900" />
          <Col className="flex items-center justify-between mt-4">
            <Text className="text-xl font-semibold">Total</Text>
            <Text className="text-xl font-semibold">
              ${selectedPlan.price} USD
            </Text>
          </Col>
          <Col className="flex items-center justify-start mt-4 mb-8">
            <Checkbox />
            <Text className="ml-4">
              I agree to the{" "}
              <span className="underline cursor-pointer">Terms of Service</span>{" "}
              and ackowledge the{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </Text>
          </Col>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Button type="primary" danger block>
                Submit
              </Button>
            </Col>
            <Col xs={24} lg={12}>
              <Button danger block onClick={() => router.push("/")}>
                Cancel
              </Button>
            </Col>
          </Row>
        </div>
      </>
    )
  );
}

export default Billing
