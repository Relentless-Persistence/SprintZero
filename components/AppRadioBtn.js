import styled from 'styled-components';
import { Radio } from 'antd';

const RadioButton = styled( Radio.Button )`
  border-color:${ props => props.checked ? "#4A801D" : "#262626" } !important;
  box-shadow:none !important;
  text-align:center !important;
  span
  {
      color:${ props => props.checked ? "#4A801D" : "#262626" } !important;
  }
    
  &::before,&:after
  {
    background-color:transparent !important;
  }

`;


export const RadioButtonWithFill = styled( Radio.Button )`
  box-shadow:none !important;
  text-align:center !important;
  background:${ props => props.checked ? "#4A801D" : "#fff" } !important;
  span
  {
      color:${ props => props.checked ? "#fff" : "#262626" } !important;
  }
  
  &::before,&:after
  {
    background-color:transparent !important;
  }

`;

export default RadioButton;
