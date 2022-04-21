import React, { useRef, useEffect, useState } from 'react';
import Head from "next/head";
import { useRouter } from 'next/router';
import { Button, Divider } from "antd";

import AppLayout from "../../../components/Dashboard/AppLayout";

import Task from '../../../components/Release/Task';

import
{
    splitRoutes,
} from "../../../utils";


import fakeData from "../../../fakeData/release.json";
import products from "../../../fakeData/products.json";

import ActionButtons from '../../../components/Personas/ActionButtons';
import { cloneDeep } from 'lodash';

const logOldData = ( data, activeProduct, activeDataIndex ) =>
{
    const activeData = data[ activeProduct ][ activeDataIndex ];

    console.log( activeData?.taskList[ 0 ].subTasks[ 0 ] );
};


const getName = list => list?.map( l => l.name );


export default function Release ()
{
    const { pathname } = useRouter();
    const chartRef = useRef( null );

    const [ data, setData ] = useState( fakeData );
    const [ disabled, setDisabled ] = useState( true );
    const dataRef = useRef( null );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );
    const [ activeDataIndex, setActiveDataIndex ] = useState( 0 );

    const [ activeVersion, setActiveVersion ] = useState( data[ activeProduct ][ activeDataIndex ]?.name );

    const [ activeData, setActiveData ] = useState( data[ activeProduct ][ activeDataIndex ] );
    const sprintCount = activeData?.sprints.length || 1;
    const percentage = 100 / sprintCount;

    const enableDrag = () =>
    {

        setDisabled( false );
    };

    const setProduct = product =>
    {
        setActiveProduct( product );
        setActiveDataIndex( 0 );
        setActiveVersion( data[ product ][ 0 ]?.name );
    };

    const setVersion = name =>
    {
        const activeVersionIndex = data[ activeProduct ].findIndex( card => card.name === name );

        if ( activeVersionIndex > -1 )
        {
            setActiveVersion( data[ activeProduct ][ activeVersionIndex ].name );
            setActiveDataIndex( activeVersionIndex );

        }
    };

    const getDuration = () =>
    {
        const end = new Date( activeData?.target ).getTime();
        const start = new Date( activeData?.start ).getTime();

        const duration = end - start;

        return duration;

    };

    const getOffset = ( subStart ) =>
    {
        const subtaskStart = new Date( subStart ).getTime();
        const start = new Date( activeData?.start ).getTime();

        const dayOffset = subtaskStart - start;
        const duration = getDuration();

        return ( dayOffset / duration ) * 100;


    };

    useEffect( () =>
    {
        if ( chartRef.current )
        {
            chartRef.current.scrollTo( 100, 0 );
        }
    }, [] );

    const onStop = ( subTaskIndex, taskIndex, newDateInMs ) =>
    {
        const newData = { ...data };
        dataRef.current = cloneDeep( data );

        const activeData = newData[ activeProduct ][ activeDataIndex ];

        const list = activeData.taskList[ taskIndex ].subTasks;

        list[ subTaskIndex ] =
        {
            ...list[ subTaskIndex ],
            "endDate": new Date( newDateInMs ).toISOString()
        };

        setActiveData( activeData );
        setData( newData );

    };

    const onCancel = () =>
    {

        const activeData = dataRef.current[ activeProduct ][ activeDataIndex ];
        setActiveData( activeData );
        setData( dataRef.current );

        setDisabled( true );
    };

    const taskList = activeData?.taskList || [];
    const duration = getDuration();

    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy tasks" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                breadCrumbItems={ splitRoutes( pathname ) }
                rightNavItems={ getName( data[ activeProduct ] ) }
                useGrid
                hasSideAdd={ false }
                hideSideBar
                setActiveRightNav={ setVersion }
                onChangeProduct={ setProduct }
                activeRightItem={ activeVersion }
                ignoreLast={ true }
                topExtra={ disabled ? <Button
                    onClick={ enableDrag }
                    size="small"
                    className='px-2 font[600] bg-white border-[#4A801D] text-[14px] leading-[22px] text-[#4A801D]'
                >
                    Edit
                </Button>
                    :

                    <ActionButtons
                        className="ml-[12px]"
                        onCancel={ onCancel }
                        onSubmit={ () => setDisabled( true ) }
                    /> }

            >

                {
                    activeData ? <>
                        <div
                            style={ {
                                height: "500px",
                                position: "relative",
                                paddingTop: "20px",
                                overflowX: "scroll",
                                overflowY: "hidden"
                            } }>
                            <div
                                ref={ chartRef }
                                style={ {
                                    width: `${ sprintCount * 339 }px`, margin: "20px",
                                    minHeight: "100%",
                                    position: "relative",
                                    background: !disabled ? "#fff" : "transparent"

                                } }>


                                {/* Vertical didviders */ }

                                {
                                    activeData?.sprints?.map( ( s, i ) => ( <Divider
                                        key={ s.id }
                                        style={ {
                                            left: `${ ( i + 1 ) * percentage }%`,
                                            ...( ( i + 1 ) === activeData?.sprints.length ? { border: "none" } : {} )

                                        } }
                                        type="vertical"
                                        className='absolute border-[#A6AE9D] border-dashed w-1px h-full m-0' /> ) )
                                }

                                {/* Sprint titles */ }


                                {
                                    activeData?.sprints?.map( ( s, i ) => ( <p
                                        style={ {
                                            left: `${ ( ( i + 1 ) * ( percentage ) ) - ( percentage / 2 ) }%`,
                                            transform: "translateY(-30px)"

                                        } }
                                        className='absolute text-[#A6AE9D]'
                                        key={ s.id }>
                                        { s.name }
                                    </p> )
                                    )
                                }

                                <div>

                                    {
                                        taskList.map( ( t, i ) => (
                                            <Task
                                                taskIndex={ i }
                                                ref={ chartRef }
                                                style={ {
                                                    top: i == 0 ? `65px` : `${ 65 + ( i * ( 35 + 150 ) ) }px`,
                                                    left: `${ getOffset( t.startDate ) }%`
                                                } }
                                                key={ t.id }
                                                subTasks={ t.subTasks }
                                                name={ t.name }
                                                start={ t.startDate }
                                                end={ t.endDate }
                                                duration={ duration }
                                                onStop={ onStop }
                                                disabled={ disabled }
                                            />
                                        ) )
                                    }

                                </div>


                            </div>
                        </div>
                    </> : null
                }

            </AppLayout>
        </div>
    );
}
