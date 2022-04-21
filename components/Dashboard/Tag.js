import React from 'react';
import { Tag } from 'antd';
import { ReadOutlined, CopyOutlined, FileOutlined } from '@ant-design/icons';
import classNames from 'classnames';

const CustomTag = (
    {
        type,
        text,
        icon,
        className,
        ...props

    }
) =>
{
    switch ( type )
    {
        case "epic":
            return <Tag
                className={ classNames( "space-x-1 border-2 border-[#4F2DC8]  px-[8px] py-[4px] text-[#4F2DC8] text-sm rounded cursor-pointer inline-flex items-center", className ) }
                icon={ <ReadOutlined /> }
                { ...props }
            >
                { text }
            </Tag>;

        case "feature":
            return <Tag
                className={ classNames( "space-x-1 border-2 border-[#006378]  px-[8px] py-[4px] text-[#006378] text-sm rounded cursor-pointer inline-flex items-center", className ) }
                icon={ <CopyOutlined /> }
                { ...props }
            >
                { text }
            </Tag>;

        case "status":
            return <Tag
                className={ classNames( "space-x-1 border-2 border-[#0073B3]  px-[8px] py-[4px] text-[#0073B3] text-sm rounded cursor-pointer inline-flex items-center", className ) }
                icon={ <FileOutlined /> }
                { ...props }
            >
                { text }
            </Tag>;

        default:
            return <Tag className={ classNames( "space-x-1 border-2 border-[#0073B3] px-[8px] py-[4px] text-[#0073B3] text-sm rounded cursor-pointer inline-flex items-center", className ) }
                icon={ icon }
                { ...props }
            >
                { text }
            </Tag>;
    }

};

export default CustomTag;
