import { Form, Row, Col, Input, Select, Card, Space, Button } from "antd";
import React, { useState, useEffect } from "react";
import {
  InfoCircleOutlined,
  CalendarOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const Billings = () => {
  const [countries, setCountries] = useState(null);

  const getCountries = async () => {
    const res = await axios.get(
      "https://countriesnow.space/api/v0.1/countries/iso"
    );
    setCountries(res.data.data);
  };

  useEffect(() => {
    getCountries();
  }, []);

  return (
    <div id="billings">
      <h3 className="font-semibold font-16 mb-3">Credit Card Details</h3>
      <Form>
        <Row gutter={16}>
          <Col>
            <Form.Item
              className="space-x-4"
              label="Card Number"
              required
              tooltip={{
                title: "Tooltip with customize icon",
                icon: <InfoCircleOutlined />,
              }}
            >
              <Input
                value="##########"
                className="border-[#101D06] hover:border-[#101D06]"
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              className="space-x-4"
              label="Expiration Date"
              required
              tooltip={{
                title: "Tooltip with customize icon",
                icon: <InfoCircleOutlined />,
              }}
            >
              <Input
                placeholder="MM/YY"
                className="w-[106px] border-[#101D06] hover:border-[#101D06]"
                suffix={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col>
            <Form.Item
              className="space-x-4"
              label="CVV"
              required
              tooltip={{
                title: "Tooltip with customize icon",
                icon: <InfoCircleOutlined />,
              }}
            >
              <Input
                value="###"
                className="w-[106px] border-[#101D06] hover:border-[#101D06]"
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              className="space-x-4"
              label="Country"
              required
              tooltip={{
                title: "Tooltip with customize icon",
                icon: <InfoCircleOutlined />,
              }}
            >
              {countries && (
                <Select
                  defaultValue={"United States"}
                  style={{ border: "1px solid #101D06", outline: "none" }}
                >
                  {countries.map((country, i) => (
                    <Option key={i} value={country.Iso2}>
                      {country.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col>
            <Form.Item
              className="space-x-4"
              label="ZIP/Postal Code"
              required
              tooltip={{
                title: "Tooltip with customize icon",
                icon: <InfoCircleOutlined />,
              }}
            >
              <Input
                value="####-####"
                className="w-[112px] border-[#101D06] hover:border-[#101D06]"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div className="mt-[42px]">
        <h3 className="font-semibold font-16 mb-3">Billing History</h3>
        <div className="space-y-3">
          <p>2022</p>
          <Card>
            <div className="flex items-center justify-between">
              <p>Jan 18th - $10.03</p>
              <Space>
                <Button className="flex items-center" icon={<EyeOutlined />}>
                  View
                </Button>
                <Button
                  className="flex items-center"
                  icon={<DownloadOutlined />}
                >
                  Download
                </Button>
              </Space>
            </div>
          </Card>
        </div>
        <div className="space-y-3">
          <p className="mt-3">2021</p>
          <Card>
            <div className="flex items-center justify-between">
              <p>Jan 18th - $10.03</p>
              <Space>
                <Button className="flex items-center" icon={<EyeOutlined />}>
                  View
                </Button>
                <Button
                  className="flex items-center"
                  icon={<DownloadOutlined />}
                >
                  Download
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billings;
