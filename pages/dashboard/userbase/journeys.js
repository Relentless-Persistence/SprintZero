import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import { Area, DualAxes } from '@ant-design/plots';

import { Select } from 'antd';


import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/performance.json";
import products from "../../../fakeData/products.json";

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


export default function Journeys ()
{
    const { pathname } = useRouter();
    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ data, setData ] = useState( fakeData );

    const [ menu, setMenu ] = useState( [] );


    const [ activeData, setActiveData ] = useState( null );
    const [ sprint, setSprint ] = useState( null );


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
    const isArea = activeData?.name.includes( "Flow" ) || activeData?.name.includes( "Velocity" );



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
                breadCrumbItems={ splitRoutes( pathname ) }>
                {/* <DualAxes
                            data={ [ sprint, sprint ] }
                            {
                            ...chartConfig[ activeData?.name ]
                            } /> */}

                {
                    !isArea ? (
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
                    isArea ?
                        <Area
                            data={ activeData?.data }
                            {
                            ...chartConfig[ activeData?.name ]
                            }
                        />
                        : ( sprint?.length ? <DualAxes
                            data={ [ sprint, sprint ] }
                            {
                            ...chartConfig[ activeData?.name ]
                            } /> : null )
                }


            </AppLayout>
        </div>
    );
}
