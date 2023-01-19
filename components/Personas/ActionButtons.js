import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "antd";

const Row = styled.div`

    display:flex;
    gap:10px;
    align-items: center;

   /* button
   {
       background: #4A801D;
       border-radius: 2px;
       font-weight: 600;
       font-size: 14px;
       line-height: 22px;
       color: #FFFFFF;
       border: 1px solid #4A801D;
       padding:1px 8px;
       box-sizing:border-box;
       flex-basis:52px;
       font-family: "SF Pro Text";
       font-weight:400;

       &.with-border
       {
           background: #fff;
           color:#4A801D;
       }
   }

   .blank
   {
       border:none;
       color:#4A801D !important;
       background-color:transparent;
   } */
`;

const ActionButtons = ( {
    onCancel, onSubmit, className
} ) =>
{
    return (
      <div className="flex items-center space-x-2 ml-4">
        <Button
          className="text-[#4A801D] text-[14px] border border-[#4A801D] cursor-pointer"
          size="small"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="small"
          className="bg-[#4A801D] hover:bg-[#5A9D24] border-none hover:border-none text-white hover:text-white text-[14px]"
          onClick={onSubmit}
        >
          Done
        </Button>
      </div>
    );
};

export const LightActionButtons = ( {
    onCancel, onSubmit, className
} ) =>
{
    return (
      <div className="flex items-center space-x-2 ml-4">
        <Button
          className="text-[#4A801D] text-[14px] border border-[#4A801D] cursor-pointer hover:text-[#5A9D24] hover:border-[#5A9D24]"
          size="small"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="small"
          className="bg-[#4A801D] hover:bg-[#5A9D24] border-none hover:border-none text-white hover:text-white text-[14px]"
          onClick={onSubmit}
        >
          Done
        </Button>
      </div>
    );
};

export default ActionButtons;
