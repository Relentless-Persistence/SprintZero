import React from 'react';
import styled from 'styled-components';
import
{
  Button,
} from 'antd';

// background:transparent;
const More = styled( Button )`
color: #4A801D;
background:#fff;
box-shadow:none;

`;


const CardHeaderButton = ( { children, ...props } ) =>
{
  return <More size="small" { ...props } >{ children }</More>;
};

export default CardHeaderButton;
