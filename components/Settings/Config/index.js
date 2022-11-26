import React, { useState, useEffect } from "react";
import { Radio, message, Input, InputNumber, Row, Col } from "antd";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { db } from "../../../config/firebase-config";
import currencyList from "../../../currency-list.json";
import Dropdown from "../../Dropdown";

const cadenceOptions = [
  { label: "One", value: "One" },
  { label: "Two", value: "Two" },
  { label: "Three", value: "Three" },
  { label: "Four", value: "Four" },
];

const gateOptions = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
];

const Config = ({
  cadence,
  setCadence,
  gate,
  setGate,
  title,
  setTitle,
  cost,
  setCost,
  currency,
  setCurrency
}) => {
  const currencies = currencyList.data;
  const [formattedCost, setformattedCost] = useState(null);

  useEffect(() => {
    if (cost) {
      let newCost = parseFloat(cost);
      setformattedCost(`${currency}${newCost.toFixed(2)} `);
    }
  }, [cost, currency]);

  return (
    <div id="config">
      <h3 className="font-semibold mb-3">Configuration</h3>
      <div className="mb-[20px]">
        <h4 className="mb-[4px]">Cadence (Weeks)</h4>

        <Radio.Group
          value={cadence}
          onChange={(e) => setCadence(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="One">One</Radio.Button>
          <Radio.Button value="Two">Two</Radio.Button>
          <Radio.Button value="Three">Three</Radio.Button>
          <Radio.Button value="Four">Four</Radio.Button>
        </Radio.Group>
      </div>
      <div>
        <h4 className="mb-[4px]">Gate</h4>
        <Radio.Group
          value={gate}
          onChange={(e) => setGate(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="Monday">Monday</Radio.Button>
          <Radio.Button value="Tuesday">Tuesday</Radio.Button>
          <Radio.Button value="Wednesday">Wednesday</Radio.Button>
          <Radio.Button value="Thursday">Thursday</Radio.Button>
          <Radio.Button value="Friday">Friday</Radio.Button>
        </Radio.Group>
      </div>
      <div className="mt-4">
        <h4 className="mb-[4px]">Product Title</h4>
        <Input
          className="w-[320px]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <h4 className="mb-[4px]">Cost Per Story Point</h4>

        <Row gutter={8}>
          <Col span={2}>
            {currencies && (
              <Dropdown
                currency={currency}
                setCurrency={setCurrency}
                currencies={currencies}
              />
            )}
          </Col>
          <Col span={4}>

              <InputNumber
                className="w-full"
                placeholder="$0.00"
                value={cost}
                step="0.00"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                onChange={(value) => setCost(value)}
              />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Config;
