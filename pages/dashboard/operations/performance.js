import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import { Area, DualAxes } from '@ant-design/plots';

import { Select } from 'antd';


import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/performance.json";
import products from "../../../fakeData/products.json";
import { clamp } from "lodash";

const generateRightNav = ( items ) =>
{
    return items.map( it => it.name );
};

const { Option } = Select;

const chartConfig =
{
    "Flow": {
        xField: 'date',
        yField: 'value',
        seriesField: 'category',
        appendPadding: 10,
        color: [ "#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#E8684A", "#6DC8EC", "#FF9D4D" ],
        legend: {
            marker:
            {
                symbol: "hyphen"
            },
            layout: 'horizontal',
            position: "top-right"
        },
    },
    "Burndown":
    {
        xField: 'date',
        yField: [ 'planned', 'added' ],
        geometryOptions: [
            {
                geometry: 'column',
            },
            {
                geometry: 'line',
                label:
                {
                    offsetY: -12,
                    formatter: ( value ) => 
                    {
                        return value.added.toFixed( 2 );
                    }
                },
                point: {
                    size: 6,
                },
                lineStyle: {
                    lineWidth: 2,
                },
            },
        ],
        legend: { layout: 'horizontal', position: "top-right" },
    },
    "Velocity": {
        xField: 'date',
        yField: 'value',
        seriesField: 'category',
        color: [ "#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#E8684A" ],
        legend: {
            marker:
            {
                symbol: "hyphen"
            },
            layout: 'horizontal',
            position: "top-right"
        },
        appendPadding: 10,
        isPercent: true,
        yAxis: {
            label: {
                formatter: ( value ) =>
                {
                    return `${ value * 100 }%`;
                },
            },
        },
    }
};

const DEFAULT_HEIGHT = 500;

export default function Performance ()
{
    const { pathname } = useRouter();
    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );
    const [ height, setHeight ] = useState( DEFAULT_HEIGHT );

    const [ data, setData ] = useState( fakeData );

    const [ menu, setMenu ] = useState( [] );


    const [ activeData, setActiveData ] = useState( null );
    const [ sprint, setSprint ] = useState( null );

    useEffect( () =>
    {
        const setChartHeight = () =>
        {

            const height = clamp( 0.6 * window.innerHeight, DEFAULT_HEIGHT, 600 );
            setHeight( height );
        };

        setChartHeight();

        window.addEventListener( "resize", setChartHeight );

        () => window.removeEventListener( "resize", setChartHeight );

    }, [] );


    useEffect( () =>
    {
        const active = data[ activeProduct ][ 0 ];
        setActiveData( active );


    }, [ data, activeProduct ] );


    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        setActiveData( data[ activeProduct ][ 0 ] );

    };

    const setActiveRightNav = ( name ) =>
    {
        const itemIndex = data[ activeProduct ].findIndex( d => d.name === name );

        if ( itemIndex > -1 )
        {
            const info = data[ activeProduct ][ itemIndex ];

            setActiveData( info );


            if ( info?.name === "Burndown" )
            {
                setSprint( info?.data[ 0 ]?.data );
                setMenu( info.data.map( d => d.sprintName ) );
            }
        }
    };

    const handleSprintChange = ( sprintName ) =>
    {
        const sprintIndex = activeData?.data?.findIndex( s => s.sprintName === sprintName );

        if ( sprintIndex > -1 )
        {
            setSprint( activeData?.data[ sprintIndex ]?.data );
        }
    };

    const rightNav = generateRightNav( data[ activeProduct ] );
    const isBurn = activeData?.name.includes( "Burn" );
    const isFlow = activeData?.name.includes( "Flow" );
    const isVel = activeData?.name.includes( "Velocity" );


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy huddle" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppLayout
                onChangeProduct={ setProduct }
                hasSideAdd={ false }
                hasMainAdd={ false }
                rightNavItems={ rightNav }
                setActiveRightNav={ setActiveRightNav }
                activeRightItem={ activeData?.name }
                mainClass="mr-[120px]"
                breadCrumbItems={ splitRoutes( pathname ) }>
                {/* <DualAxes
                            data={ [ sprint, sprint ] }
                            {
                            ...chartConfig[ activeData?.name ]
                            } /> */}

                {
                    isBurn ? (
                        <Select
                            defaultValue={ menu[ 0 ] }
                            style={ { width: 120 } }
                            value={ sprint?.sprintName }
                            onChange={ handleSprintChange }>
                            {
                                menu.map( ( m, i ) => <Option
                                    key={ i }
                                    value={ m }>{ m }</Option> )
                            }
                        </Select>
                    ) : null
                }


                {
                    isBurn ? ( sprint?.length ? <DualAxes
                        height={ 0.9 * height }
                        data={ [ sprint, sprint ] }
                        {
                        ...chartConfig[ activeData?.name ]
                        } /> : null ) : null
                }

                {
                    isVel ? <Area
                        data={ activeData?.data }
                        height={ height }

                        {
                        ...chartConfig[ activeData?.name ]
                        }
                    /> : null
                }

                {
                    isFlow ?
                        <Area
                            data={ activeData?.data }
                            height={ height }

                            {
                            ...chartConfig[ activeData?.name ]
                            }
                        />
                        : null
                }


            </AppLayout>
        </div>
    );
}
