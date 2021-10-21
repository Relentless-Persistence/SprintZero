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

const ProductGate = ({setGate}) => {
  return (
    <>
      <div className="text-center mb-4">
        <Title style={{ margin: 0 }} level={3}>
          Cadence
        </Title>
        <Text>How many weeks will you spend on each sprint?</Text>
      </div>

      <div className="flex flex-col items-center justify-center">
        <Group buttonStyle="outline">
          {days.map((day) => (
            <Col className="mb-4 text-center" key={day}>
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
