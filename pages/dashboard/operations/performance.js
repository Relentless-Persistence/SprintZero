import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import { Area, DualAxes } from '@ant-design/plots';

import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/performance.json";
import products from "../../../fakeData/products.json";

const generateRightNav = ( items ) =>
{
    return items.map( it => it.name );
};

const chartConfig =
{
    "Flow": {
        xField: 'date',
        yField: 'value',
        seriesField: 'category',
        appendPadding: 10,
        color: [ "#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#E8684A", "#6DC8EC", "#FF9D4D" ],
        legend: { layout: 'horizontal', position: "top-right" },
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
        legend: { layout: 'horizontal', position: "top-right" },
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


export default function Huddle ()
{
    const { pathname } = useRouter();
    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ data, setData ] = useState( fakeData );


    const [ activeData, setActiveData ] = useState( null );

    useEffect( () =>
    {
        setActiveData( data[ activeProduct ][ 0 ] );
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
            setActiveData( data[ activeProduct ][ itemIndex ] );
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
                            data={ [ activeData?.data[ 0 ]?.data, activeData?.data[ 0 ]?.data ] }
                            {
                            ...chartConfig[ activeData?.name ]
                            } /> */}

                {
                    isArea ?
                        <Area
                            data={ activeData?.data }
                            {
                            ...chartConfig[ activeData?.name ]
                            }
                        />
                        : <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore odio cupiditate nam excepturi omnis molestias modi quisquam illum rem perferendis, commodi corporis, laudantium est natus mollitia deserunt, assumenda in officia.
                        </p>
                }


            </AppLayout>
        </div>
    );
}
