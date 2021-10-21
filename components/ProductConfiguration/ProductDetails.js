import React from "react";
import {
  Button,
  Typography,
  Carousel,
  Card,
  Col,
  Row,
  Form,
  Input,
} from "antd";
import update from "immutability-helper";

const { Title, Text } = Typography;
const { Item } = Form;

const ProductDetails = ({
  product,
  setProduct,
  email1,
  setEmail1,
  email2,
  setEmail2,
  email3,
  setEmail3,
}) => {
  const count = [0, 1, 2];

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
        <Input
          maxLength="32"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />
        <Text className="text-xs">32 Character Limit</Text>
      </Col>

      <div>
        <Text className="font-semibold" style={{ fontSize: "16px" }}>
          Team
        </Text>
        <Col className="mb-2">
          <Input
            placeholder="Email Address"
            value={email1}
            onChange={(e) => setEmail1(e.target.value)}
          />
          <Text className="text-xs">Slot 1</Text>
        </Col>

        <Col className="mb-2">
          <Input
            placeholder="Email Address"
            value={email2}
            onChange={(e) => setEmail2(e.target.value)}
          />
          <Text className="text-xs">Slot 2</Text>
        </Col>

        <Col className="mb-2">
          <Input
            placeholder="Email Address"
            value={email3}
            onChange={(e) => setEmail3(e.target.value)}
          />
          <Text className="text-xs">Slot 3</Text>
        </Col>
      </div>
    </>
  );
};

export default ProductDetails;
