import React, { useState } from "react";
import { Radio, message } from "antd";
import { activeProductState } from "../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { db } from "../../config/firebase-config";

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

const Config = ({ product }) => {
  const [cadence, setCadence] = useState(product.cadence);
  const [gate, setGate] = useState(product.gate);

  const updateCadence = (cadence) => {
    db.collection("Product")
      .doc(product.id)
      .update({
        cadence
      })
      .then(() => {
        message.success("Cadence updated successfully");
        // window.location.reload(false);
      });
  };

  const updateGate = (gate) => {
    db.collection("Product")
      .doc(product.id)
      .update({
        gate
      })
      .then(() => {
        message.success("Gate updated successfully");
        // window.location.reload(false);
      });
  };

  return (
    <div id="config">
      <h3 className="font-semibold font-16 mb-3">Configuration</h3>
      <div className="mb-[20px]">
        <h4 className="mb-3">Cadence (Weeks)</h4>

        <Radio.Group
          defaultValue={cadence}
          onChange={(e) => updateCadence(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="One">One</Radio.Button>
          <Radio.Button value="Two">Two</Radio.Button>
          <Radio.Button value="Three">Three</Radio.Button>
          <Radio.Button value="Four">Four</Radio.Button>
        </Radio.Group>
      </div>
      <div>
        <h4 className="mb-3">Gate</h4>
        <Radio.Group
          defaultValue={gate}
          onChange={(e) => updateGate(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="Monday">Monday</Radio.Button>
          <Radio.Button value="Tuesday">Tuesday</Radio.Button>
          <Radio.Button value="Wednesday">Wednesday</Radio.Button>
          <Radio.Button value="Thursday">Thursday</Radio.Button>
          <Radio.Button value="Friday">Friday</Radio.Button>
        </Radio.Group>
      </div>
    </div>
  );
};

export default Config;
