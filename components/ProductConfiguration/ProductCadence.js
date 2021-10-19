import React from 'react'
import {
  Button,
  Typography
} from "antd";

const { Title, Text } = Typography;

const ProductCadence = () => {
  return (
    <div className="h-72">
      <div className="text-center mb-8">
        <Title style={{ margin: 0 }} level={3}>
          Cadence
        </Title>
        <Text>How many weeks will you spend on each sprint?</Text>
      </div>

      <div className="flex flex-col items-center justify-center">
        <Button
          className="mb-4"
          style={{ width: "130px" }}
          type="primary"
          ghost
        >
          One Week
        </Button>

        <Button
          className="mb-4"
          style={{ width: "130px" }}
          type="primary"
          ghost
        >
          Two Weeks
        </Button>

        <Button
          className="mb-4"
          style={{ width: "130px" }}
          type="primary"
          ghost
        >
          Three Weeks
        </Button>
      </div>
    </div>
  );
}

export default ProductCadence
