import React, { useState } from "react";
import styled from "styled-components";

const Row = styled.div`

    display:flex;
    gap:10px;

   button
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
   }
`;

const ActionButtons = ( {
    onCancel, onSubmit, className
} ) =>
{
    return (
        <Row className={ className }>
            <button className="with-border" onClick={ onCancel } type="button">Cancel</button>
            <button onClick={ onSubmit } type="button">Done</button>

        </Row>
    );
};

export const LightActionButtons = ( {
    onCancel, onSubmit, className
} ) =>
{
    return (
        <Row className={ className }>
            <button className="blank" onClick={ onCancel } type="button">Cancel</button>
            <button className="with-border" onClick={ onSubmit } type="button">Done</button>

        </Row>
    );
};

export default ActionButtons;
