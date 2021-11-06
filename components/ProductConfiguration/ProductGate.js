import React from "react";
import { Typography, Radio, Col } from "antd";

const { Title, Text } = Typography;
const { Group, Button } = Radio;

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ProductGate = ({setGate, error}) => {
  return (
    <>
      <div className="text-center mb-4">
        <Title style={{ margin: 0 }} level={3}>
          Gate
        </Title>
        <Text>Which day would you like to begin your sprints?</Text>
        {error ? (
          <div className="text-sm text-red-600 mt-4">*Please select a gate</div>
        ) : null}
      </div>

      <div className="flex flex-col items-center justify-center">
        <Group buttonStyle="outline">
          {days.map((day) => (
            <Col className="mb-2 text-center" key={day}>
              <Button
                style={{ width: "130px" }}
                value={day}
                onChange={(e) => setGate(e.target.value)}
              >
                {day}
              </Button>
            </Col>
          ))}
        </Group>
      </div>
    </>
  );
}

export default ProductGate
