import { Alert } from "antd";
import React from "react";

const CustomTag = ({ shortTitle, feature }) => {
  return (
    <div className="w-full bg-[#FAFAFA] border border-[#A6AE9D] rounded py-2 px-[10px]">
      <p className="text-[#101D06] font-semibold text-xs">{shortTitle}</p>
      <span className="bg-[#E1F4D1] py-[0.5px] px-[4.5px] border border-[#AEE383] rounded-[1.25532px] text-[#315613]">
        {feature}
      </span>
    </div>
  );
};

export default CustomTag;
