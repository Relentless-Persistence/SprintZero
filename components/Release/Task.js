import React, { useRef } from 'react';
import { Divider, Tag } from "antd";
import Draggable from 'react-draggable';

import styled from 'styled-components';
import { ReadOutlined } from '@ant-design/icons';
import { differenceInDays, scaleToScreen, scaleToVal, timeScale } from '../../utils';
import { clamp } from 'lodash';
import { DraggableSubTask } from '../Priorities';


const TaskItem = styled.div`
  position: absolute;
  border-left: 2px solid #054988;
  border-right: 2px solid #054988;;
`;

const TaskContent = styled.div`
 position: relative;   
    min-height: 8px;
`;

const Line = styled.div`
    position:absolute;
    width:100%;
    height:2px;
    content:"";
    background:#054988;
    top:50%;
    margin:0;
    transform:translateY(-50%);

`;

const Name = styled( Tag )`
  position: absolute;
  bottom: 100%;
  background: #FFFFFF;
  margin-bottom: 6px;
`;

const Task = React.forwardRef( ( {
    name = "Task name",
    taskIndex,
    disabled,
    subTasks = [],
    onStop,
    duration,
    start,
    end,
    style,
    ...props
}, ref ) =>
{

    const taskRef = useRef( null );

    const getTaskDuration = () => 
    {
        const _end = new Date( end );
        const _start = new Date( start );

        const taskDur = differenceInDays( _end, _start );
        return taskDur;
    };

    const getWidth = () =>
    {

        const taskDur = getTaskDuration();
        const width = ( taskDur / duration ) * 100;

        return width;

    };

    const getSubOffset = ( subEnd ) =>
    {
        const _start = new Date( start );
        const _end = new Date( subEnd );
        const taskDur = getTaskDuration();
        const subtaskDur = differenceInDays( _end, _start );

        const offset = ( subtaskDur / taskDur ) * 100;

        return offset;

    };

    const handleStop = ( e, itemData, i ) =>
    {

        const node = itemData.node.getBoundingClientRect();
        const nodeWidth = node.width;

        const parentChart = taskRef?.current.getBoundingClientRect();
        const parentWidth = parentChart.width;
        const maxPossibleX = parentWidth - nodeWidth;

        const newX = itemData.lastX;


        const _start = new Date( start ).getTime();
        const _end = new Date( end ).getTime();

        const newEndDate = timeScale( 0, maxPossibleX, _start, _end, newX );

        onStop( i, taskIndex, newEndDate );

    };


    return (
        <TaskItem
            style={ {
                ...style,
                width: `${ getWidth() }%`
            } }
            { ...props }

        >
            <div
                className='subtask-wrapper'
                ref={ taskRef }>
                <TaskContent>
                    <Line />

                    <Name
                        className="flex items-center space-x-1 border-2 border-[#4F2DC8] px-[8px] py-[4px] text-[#4F2DC8] text-sm rounded cursor-pointer"
                        icon={ <ReadOutlined /> }>
                        { name }
                    </Name>



                    {
                        subTasks?.map( ( s, i ) => (
                            <DraggableSubTask
                                disabled={ disabled }
                                ref={ taskRef }
                                item={ s }
                                index={ i }
                                handleStop={ handleStop }
                                key={ s.id }
                                taskStart={ start }
                                taskEnd={ end }
                                offset={ `${ getSubOffset( s.endDate ) }% ` }
                            />
                        ) )
                    }



                </TaskContent>
            </div>
        </TaskItem>
    );
} );

Task.displayName = "Task";

export default Task;
