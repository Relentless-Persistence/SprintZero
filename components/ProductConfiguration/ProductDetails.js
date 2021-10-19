import React from 'react'
import { Button, Typography, Carousel, Card, Col, Row, Form, Input } from "antd";

const { Title, Text } = Typography;
const {Item} = Form;

const ProductDetails = () => {
  const count = [0, 1, 2]
  return (
    <>
      <div className="text-center mb-4">
        <Title style={{ margin: 0 }} level={3}>
          Details
        </Title>
        <Text>Please provide the information below.</Text>
      </div>

      <Col className="mb-2">
        <Text className="font-semibold mb-2" style={{ fontSize: "16px" }}>
          Product
        </Text>
        <Input maxLength="32" />
        <Text className="text-xs">32 Character Limit</Text>
      </Col>

      <div>
        <Text className="font-semibold" style={{ fontSize: "16px" }}>
          Team
        </Text>
        {count.map((item, i) => (
          <Col className="mb-2" key={i}>
            <Input placeholder="Email Address" />
            <Text className="text-xs">Slot {i+1}</Text>
          </Col>
        ))}
      </div>
    </>
  );
}

export default ProductDetails
