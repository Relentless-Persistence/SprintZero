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

const Link = styled( Button )`
color: #4A801D;
box-shadow:none;
border:none;
`;

const CardHeaderLink = ( { children, ...props } ) =>
{
  return <Link size="small" { ...props } >{ children }</Link>;
};



const CardHeaderButton = ( { children, ...props } ) =>
{
  return <More size="small" { ...props } >{ children }</More>;
};

export 
{
  CardHeaderLink
};

export default CardHeaderButton;
