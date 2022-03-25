import React from 'react';
import { Divider, Tag } from "antd";
import
{
    ArrowUpOutlined,
    ArrowRightOutlined
} from "@ant-design/icons";

const DraggableContainer = React.forwardRef( ( { disable, children, styles }, ref ) =>
{
    return (
        <div className='relative pl-[20px]'>
            <div ref={ ref }
                style={ {
                    position: "relative",
                    //height: "795px",
                    height: "68vh",
                    marginTop: "30px",
                    marginRight: "34px",
                    background: disable ? "" : "#fff",
                    ...styles
                } } >

                {/* chart dividers */ }
                <Divider className='absolute border-[#A6AE9D] border-dashed top-2/4 h-px m-0' />

                <Divider
                    type="vertical"
                    className='absolute border-[#A6AE9D] border-dashed left-2/4 w-1px h-full m-0' />

                {/* Axes */ }
                <div className="absolute flex items-end text-[#A6AE9D] m-0 bottom-0 w-full">
                    <Divider className="border-[#A6AE9D] m-0" />
                    <ArrowRightOutlined
                        style={ { transform: "translate(-2.43px,6.65px)" } }
                        color='#A6AE9D' />
                </div>

                <div className="absolute left-0 flex-col flex text-[#A6AE9D] m-0 h-full">
                    <ArrowUpOutlined
                        style={ { transform: "translate(-6.35px, 0.57px)" } }
                        color='#A6AE9D' />
                    <Divider type="vertical"
                        className="border-[#A6AE9D] m-0 h-full" />

                </div>

                { children }

            </div >
            {/* x-axis labels */ }
            <div className='flex justify-between mt-[10px] mr-[34px]'>
                <p className='text-[#A6AE9D] '>Low Feasiblitity</p>
                <p className='text-[#A6AE9D] '>High Feasiblitity</p>

            </div>

            {/* y-axis labels */ }
            <div style={ { width: "68vh" } } className='absolute left-0 top-0 left-0 flex justify-between transform rotate-90 origin-left'>
                <p className='text-[#A6AE9D] transform rotate-180'>High Value</p>

                <p className='text-[#A6AE9D] transform rotate-180'>Low Value</p>

            </div>

        </div>
    );
} );

DraggableContainer.displayName = DraggableContainer;

export { DraggableContainer };
