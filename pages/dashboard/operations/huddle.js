import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import
{
    Row,
    Col,
    Card,

} from 'antd';


import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes, getTimeAgo } from "../../../utils";

import fakeData from "../../../fakeData/huddleData.json";
import products from "../../../fakeData/products.json";
import HuddleCard from "../../../components/Hubble/Huddle";

const generateRightNav = ( items ) =>
{
    if ( !items?.length )
    {
        return [ "Now" ];
    }

    return items.map( it => (
        {
            render: () => getTimeAgo( it.createdAt ),
            value: it.createdAt
        }
    ) );
};



export default function Huddle ()
{
    const { pathname } = useRouter();
    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ data, setData ] = useState( fakeData );
    const [ activeTimeIndex, setActiveTimeIndex ] = useState( 0 );
    const [ activeTime, setActiveTime ] = useState( data[ activeProduct ][ activeTimeIndex ] );

    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        setActiveTimeIndex( 0 );
        setActiveTime( data[ product ][ 0 ] );
    };

    const setActiveRightNav = ( date ) =>
    {
        const activeData = data[ activeProduct ];

        const huddleIndex = activeData.findIndex( h => h.createdAt === date );


        if ( huddleIndex > -1 )
        {
            const huddle = activeData[ huddleIndex ];
            setActiveTime( huddle );
            setActiveTimeIndex( huddleIndex );

        }
    };

    const handleCheck = ( itemIndex, sectionKey, cardIndex ) =>
    {
        const newData = { ...data };
        const activeData = newData[ activeProduct ];
        const comments = activeData[ activeTimeIndex ].comments;


        comments[ cardIndex ].data[ sectionKey ][ itemIndex ].complete = !comments[ cardIndex ].data[ sectionKey ][ itemIndex ].complete;

        setData( newData );



    };

    const onClickAddNew = ( sectionKey, cardIndex ) =>
    {

        const newData = { ...data };
        const activeData = newData[ activeProduct ];
        const comments = activeData[ activeTimeIndex ].comments;

        comments[ cardIndex ].data[ sectionKey ].push( {
            text: "",
            complete: false
        } );

        setData( newData );

    };

    const doneAddNew = ( sectionKey, cardIndex, value, callback ) =>
    {

        const newData = { ...data };
        const activeData = newData[ activeProduct ];
        let comments = activeData[ activeTimeIndex ].comments;

        const val = value?.trim() || "";

        if ( val )
        {
            const length = comments[ cardIndex ].data[ sectionKey ].length - 1;
            comments[ cardIndex ].data[ sectionKey ][ length ].text = val;
        }
        else
        {
            comments[ cardIndex ].data[ sectionKey ] = comments[ cardIndex ].data[ sectionKey ].filter( x =>
            {
                return x?.text?.trim().length > 0;
            } );
        }

        setData( newData );
        callback();

    };


    const rightNav = generateRightNav( data[ activeProduct ] );


    return (
        <div>
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy huddle" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppLayout
                onChangeProduct={ setProduct }
                hasSideAdd={ false }
                defaultText={
                    activeTime ? getTimeAgo( new Date( activeTime?.createdAt ) ) : ""
                }
                rightNavItems={ rightNav }
                setActiveRightNav={ setActiveRightNav }
                activeRightItem={ activeTime?.createdAt }
                mainClass="mr-[140px]"
                breadCrumbItems={ splitRoutes( pathname ) }
            >
                <Row className="max-w-[1200px] overflow-x-auto" gutter={ [ 16, 16 ] }>
                    { activeTime ? (
                        <>
                            { activeTime?.comments?.map( ( c, index ) => (
                                <Col className="flex" key={ index } span={ 8 }>
                                    <HuddleCard
                                        comment={ c }
                                        handleCheck={ handleCheck }
                                        onClickAddNew={ onClickAddNew }
                                        doneAddNew={ doneAddNew }
                                        index={ index }

                                    />
                                </Col>
                            ) ) }
                        </>
                    ) : (
                        <h2 className="text-[#595959] text-center">Nothing to see</h2>
                    ) }
                </Row>
            </AppLayout>
        </div>
    );
}
