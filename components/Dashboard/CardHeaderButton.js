import React from 'react';
import styled from 'styled-components';
import
{
  Button,
} from 'antd';


const More = styled( Button )`
color: #009C7E;
background:transparent;
box-shadow:none;
border:none;
`;


const CardHeaderButton = ( { children, ...props } ) =>
{
  return <More { ...props } >{ children }</More>;
};

export default CardHeaderButton;
