import React from "react";
import { Button, Typography } from "antd";

const { Title, Text } = Typography;

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ProductGate = () => {
  return (
    <>
      <div className="text-center mb-4">
        <Title style={{ margin: 0 }} level={3}>
          Cadence
        </Title>
        <Text>How many weeks will you spend on each sprint?</Text>
      </div>

      <div className="flex flex-col items-center justify-center">
        {days.map(day => (
          <Button
          key={day}
          className="mb-4"
          style={{ width: "130px" }}
          type="primary"
          ghost
        >
          {day}
        </Button>
        ))}
        
      </div>
    </>
  );
}

export default ProductGate
