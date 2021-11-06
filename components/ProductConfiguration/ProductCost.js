import React from "react";
import { Typography, Col, Row, Form, Input, Select } from "antd";
import currencyList from "../../currency-list.json";

const { Title, Text } = Typography;
const { Item } = Form;
const { Option } = Select;

const ProductCost = ({ currency, setCurrency, cost, setCost }) => {
  const currencies = currencyList.data;
  return (
    <>
      <div className="text-center mb-4">
        <Title style={{ margin: 0 }} level={3}>
          Effort Cost
        </Title>
        <Text>How much is 1 story point?</Text>
      </div>

      <div className="h-72 flex items-center justify-center">
        <Row gutter={8}>
          <Col span={6}>
            {currencies && (
              <select className="custom-select" defaultValue={currency} onChange={(e) => setCurrency(e)}>
                {currencies.map((currency, i) => (
                  <option key={i} value={currency.code}>
                    {currency.code}
                  </option>
                ))}
              </select>
            )}
          </Col>
          <Col span={18}>
            <Item>
              <Input
                placeholder="$0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
              <Text className="text-xs">Optional</Text>
            </Item>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ProductCost;
