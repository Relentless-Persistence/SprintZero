import React from 'react';
import styled from 'styled-components';
import
{
  Button,
} from 'antd';


const More = styled( Button )`
color: #4A801D;
background:transparent;
box-shadow:none;
border:none;
`;


const CardHeaderButton = ( { children, ...props } ) =>
{
  return <More { ...props } >{ children }</More>;
};

export default CardHeaderButton;
