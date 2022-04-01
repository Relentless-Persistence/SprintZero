import styled from 'styled-components';
import { Checkbox } from 'antd';

const AppCheckbox = styled( Checkbox )`
        .ant-checkbox-checked .ant-checkbox-inner 
        {
            background: #4A801D;
            border: 1px solid #4A801D;
            border-radius: 2px;
        }
`;

export default AppCheckbox;
