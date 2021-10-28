import React, { useState } from "react";
import { Typography, Radio, Col } from "antd";

const { Title, Text } = Typography;
const { Group, Button } = Radio;

const ProductCadence = ({ setCadence, error }) => {
  return (
    <div className="h-72">
      <div className="text-center mb-8">
        <Title style={{ margin: 0 }} level={3}>
          Cadence
        </Title>
        <Text>How many weeks will you spend on each sprint?</Text>
        {error ? (
          <div className="text-sm text-red-600 mt-4">*Please select a cadence</div>
        ) : null}
      </div>

      <div className="flex flex-col items-center justify-center">
        <Group buttonStyle="outline">
          <Col className="mb-4 text-center">
            <Button
              style={{ width: "130px" }}
              value="One"
              onChange={(e) => setCadence(e.target.value)}
            >
              One Week
            </Button>
          </Col>
          <Col className="mb-4 text-center">
            <Button
              style={{ width: "130px" }}
              value="Two"
              onChange={(e) => setCadence(e.target.value)}
            >
              Two Week
            </Button>
          </Col>
          <Col className="mb-4 text-center">
            <Button
              style={{ width: "130px" }}
              value="Three"
              onChange={(e) => setCadence(e.target.value)}
            >
              Three Week
            </Button>
          </Col>
        </Group>
      </div>
    </div>
  );
};

export default ProductCadence;
