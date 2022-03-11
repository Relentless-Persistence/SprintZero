import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';


import
{
    Tag
} from 'antd';
import { scaleToScreen } from '../../utils';


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

DraggableTab.displayName = "DraggableTab";

export { DraggableTab };
