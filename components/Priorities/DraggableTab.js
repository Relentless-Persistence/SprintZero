import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import { Tag } from "antd";
import { CopyOutlined } from '@ant-design/icons';

const SubTask = styled( Tag )`
  position: absolute;
  top: 100%;
  margin-top: 6px;
  transform-origin: top right;

`;

const Circle = styled.div`
  position: absolute; 
  border: 2px solid #4F2DC8;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  top:-50%;
  transform: translate(0%,-50%);
  background: #FFFFFF;
  z-index:2;
`;



import { differenceInDays, scaleToScreen } from '../../utils';


const DraggableTab = React.forwardRef( ( {
    disable,
    index,
    label,
    onClickItem,
    onStop, val }, ref ) => 
{
    const nodeRef = useRef();

    const [ pos, setPos ] = useState(
        {
            x: 0,
            y: 0

        }
    );

    useEffect( () =>
    {
        if ( nodeRef?.current )
        {

            const node = nodeRef?.current.getBoundingClientRect();
            const nodeWidth = node.width;
            const nodeHeight = node.height;

            const parent = ref?.current.getBoundingClientRect();
            const parentWidth = parent.width;
            const parentHeight = parent.height;


            const maxPossibleX = parentWidth - nodeWidth;
            const maxPossibleY = parentHeight - nodeHeight;

            //flip Y cuz graph y axiz is opposite to screen y axes
            setPos(
                {
                    x: scaleToScreen( val.x, maxPossibleX ),
                    y: scaleToScreen( 100 - val.y, maxPossibleY )
                }
            );

        }
    }, [ val, ref ] );

    const handleStop = ( e, data ) =>
    {
        onStop( e, data, index );
    };

    return (
        <Draggable
            axis="x"
            onStop={ handleStop }
            bounds="parent"
            position={ pos }
            nodeRef={ nodeRef }
            disabled={ disable }

        >
            <Tag
                onClick={ () => onClickItem( index ) }
                className='space-x-1 border-2 border-[#0073B3] px-[8px] py-[4px] text-[#0073B3] text-sm rounded'
                style={ { zIndex: 4, cursor: disable ? "" : "pointer" } }
                ref={ nodeRef }>
                { label }
            </Tag>
        </Draggable>

    );
} );

const DraggableSubTask = React.forwardRef( ( { item, index, taskStart, taskEnd, disabled,
    handleStop }, ref ) =>
{
    const subTaskRef = useRef( null );
    const [ pos, setPos ] = useState(
        {
            x: 0,
            y: 0
        }
    );

    useEffect( () =>
    {
        if ( subTaskRef?.current )
        {
            const node = subTaskRef?.current.getBoundingClientRect();
            const nodeWidth = node.width;

            const parent = ref?.current.getBoundingClientRect();
            const parentWidth = parent.width;
            const maxPossibleX = parentWidth - nodeWidth;

            const offset = differenceInDays( new Date( item.endDate ), new Date( taskStart ) );

            const duration = differenceInDays( new Date( taskEnd ), new Date( taskStart ) );


            setPos(
                {
                    x: scaleToScreen( offset, maxPossibleX, duration ),
                    y: 0
                }
            );

        }
    }, [ item, ref, taskStart, taskEnd ] );

    const onStop = ( e, itemData ) =>
    {
        handleStop( e, itemData, index );
    };




    return ( <Draggable
        axis="x"
        bounds="parent"
        position={ pos }
        nodeRef={ subTaskRef }
        disabled={ disabled }
        onStop={ onStop }>
        <SubTask
            ref={ subTaskRef }
            className="flex items-center space-x-1 border-2 border-[#006378]  px-[8px] py-[4px] text-[#006378] text-sm rounded cursor-pointer"
            icon={ <CopyOutlined /> }
        >
            { item.name }

            <Circle />
        </SubTask>

    </Draggable> );

} );

DraggableTab.displayName = "DraggableTab";
DraggableSubTask.displayName = "DraggableSubTask";

export { DraggableTab, DraggableSubTask };
