import React from 'react';
import { FilterOutlined } from '@ant-design/icons';
import
{
    Dropdown
} from 'antd';

import styled from "styled-components";

export const DropdownBtn = styled( Dropdown.Button )`
    background:#fff !important;
`;


export const DropDwnBtn = (
    {
        value = "All",
        menu,
        key,
        icon = <FilterOutlined />,
        placement
    }
) =>
{
    return (
        <DropdownBtn
            overlay={ menu }
            key={ key }
            placement={ placement }
            icon={ icon }>
            { value }
        </DropdownBtn>
    );
};
