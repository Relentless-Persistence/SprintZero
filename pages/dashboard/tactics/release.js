import React, { useRef, useEffect, useState } from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import Head from "next/head";
import { useRouter } from 'next/router';
import { Divider } from "antd";

import AppLayout from "../../../components/Dashboard/AppLayout";

import Task from '../../../components/Release/Task';

import
{
    formatDateTime,
    splitRoutes,
    differenceInDays,
    isBefore
} from "../../../utils";

import fakeData from "../../../fakeData/release.json";
import products from "../../../fakeData/products.json";

const getName = list => list?.map( l => l.name );


export default function Release ()
{
    const { pathname } = useRouter();
    const chartRef = useRef( null );

    const [ data, setData ] = useState( fakeData );
    const [ showCalendar, setShowCalendar ] = useState( false );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );
    const [ activeDataIndex, setActiveDataIndex ] = useState( 0 );

    const [ activeVersion, setActiveVersion ] = useState( data[ activeProduct ][ activeDataIndex ]?.name );

    const activeData = data[ activeProduct ][ activeDataIndex ];
    const sprintCount = activeData.sprints.length;
    const percentage = 100 / sprintCount;
    const target = activeData?.target;

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
        const end = new Date( activeData.target );
        const start = new Date( activeData.start );

        const duration = differenceInDays( end, start );

        return duration;

    };

    const getOffset = ( subStart ) =>
    {
        const subtaskStart = new Date( subStart );
        const start = new Date( activeData.start );

        const dayOffset = differenceInDays( subtaskStart, start );
        const duration = getDuration();

        return ( dayOffset / duration ) * 100;


    };


    useEffect( () =>
    {
        //start chart in 0 scroll
        if ( chartRef.current )
        {
            chartRef.current.scrollTo( 100, 0 );
        }
    }, [] );

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
            >

                <ScrollContainer
                    style={ {
                        height: "500px",
                        position: "relative",
                        paddingTop: "20px"
                    } }>
                    <div
                        ref={ chartRef }
                        style={ {
                            width: `${ sprintCount * 339 }px`, margin: "20px",
                            minHeight: "100%",
                            position: "relative",

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
                                    />
                                ) )
                            }

                        </div>


                    </div>
                </ScrollContainer>

            </AppLayout>
        </div>
    );
}
