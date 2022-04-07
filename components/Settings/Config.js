import React from 'react';
import { Radio } from "antd";

const cadenceOptions = [
  { label: "One", value: "1" },
  { label: "Two", value: "2" },
  { label: "Three", value: "3" },
  { label: "Four", value: "4" },
];

const gateOptions = [
  { label: "Monday", value: "Mon" },
  { label: "Tuesday", value: "Tue" },
  { label: "Wednesday", value: "Wed" },
  { label: "Thursday", value: "Thurs" },
  { label: "Friday", value: "Fri" },
];

const Config = () => {
  
  return (
    <div id="config">
      <h3 className="font-semibold font-16 mb-3">Configuration</h3>
      <div className="mb-[20px]">
        <h4 className="mb-3">Cadence (Weeks)</h4>
        <Radio.Group options={cadenceOptions} optionType="button" />
      </div>
      <div>
        <h4 className="mb-3">Gate</h4>
        <Radio.Group options={gateOptions} optionType="button" />
      </div>
    </div>
  );
}

export default Config;
