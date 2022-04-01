import styled from 'styled-components';
import { Radio } from 'antd';

const RadioButton = styled( Radio.Button )`
  border-color:${ props => props.checked ? "#4A801D" : "#262626" } !important;
  box-shadow:none !important;
  span
  {
      color:${ props => props.checked ? "#4A801D" : "#262626" } !important;
  }

`;

export default RadioButton;
