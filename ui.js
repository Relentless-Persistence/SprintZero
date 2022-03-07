import React from 'react';
import { Tag } from 'antd';
import { ReadOutlined, CopyOutlined, FileOutlined, PlusCircleFilled } from '@ant-design/icons';

const Ui = () =>
{
    return (
        <div className="flex items-center space-x-3">
            <div className="">
                <Tag
                    className="flex items-center space-x-1 border-2 border-[#4F2DC8] border-dashed px-[8px] py-[4px] text-[#4F2DC8] text-sm rounded cursor-pointer"
                    icon={ <ReadOutlined /> }
                >
                    Add Epic
                </Tag>
            </div>

            <div className="">
                <Tag
                    className="flex items-center space-x-1 border-2 border-[#006378] border-dashed px-[8px] py-[4px] text-[#006378] text-sm rounded cursor-pointer"
                    icon={ <CopyOutlined /> }
                >
                    Add Feature
                </Tag>
            </div>

            <div className="">
                <Tag className="flex items-center space-x-1 border-2 border-[#0073B3] border-dashed px-[8px] py-[4px] text-[#0073B3] text-sm rounded cursor-pointer">
                    Add Story
                </Tag>
            </div>

            <div className="">
                <Tag
                    className="flex items-center space-x-1 border-2 border-[#4F2DC8] px-[8px] py-[4px] text-[#4F2DC8] text-sm rounded"
                    icon={ <ReadOutlined /> }
                >
                    Phone
                </Tag>
            </div>

            <div className="">
                <Tag
                    className="flex items-center space-x-1 border-2 border-[#006378] px-[8px] py-[4px] text-[#006378] text-sm rounded"
                    icon={ <CopyOutlined /> }
                >
                    Active
                </Tag>
            </div>

            <div className="flex items-center border-2 border-[#0073B3] rounded">
                <div className="bg-[#0073B3] text-white py-[7px] px-[2px] -ml-[1px]">
                    <p className="-rotate-90 text-xs">1.0</p>
                </div>

                <div className="flex items-center justify-center text-[#0073B3] text-[14px] px-[8px]">
                    <FileOutlined className="mr-1" />
                    Billing
                </div>
            </div>

            <PlusCircleFilled className="text-[#73C92D]" />
        </div>
    );
};

export default Ui;
