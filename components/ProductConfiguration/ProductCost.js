import React from "react";
import {
  Typography,
  Col,
  Row,
  Form,
  Input,
  Select
} from "antd";

const { Title, Text } = Typography;
const { Item } = Form;
const { Option } = Select;

const ProductCost = () => {
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
            <Select defaultValue="USD">
              <Option>USD</Option>
            </Select>
          </Col>
          <Col span={18}>
            <Item>
              <Input placeholder="$0.00" />
              <Text className="text-xs">Optional</Text>
            </Item>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ProductCost;
