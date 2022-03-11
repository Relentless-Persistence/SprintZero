import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';


import AppLayout from "../../../components/Dashboard/AppLayout";
import StatementForm from "../../../components/Vision/StatementForm";

import { checkEmptyArray, checkEmptyObject, getTimeAgo, splitRoutes } from "../../../utils";
import products from "../../../fakeData/products.json";

import fakeData from "../../../fakeData/visionData.json";
import Deck from "../../../components/Vision/Deck";



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

export default function Visions ()
{
    const [ visionData, setVisionData ] = useState( fakeData );
    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );
    const [ vision, setVision ] = useState( checkEmptyArray( visionData[ activeProduct ] ) ? "Now" : visionData[ activeProduct ][ 0 ].createdAt );
    const [ info, setInfo ] = useState( {} );
    const [ inEditMode, setEditMode ] = useState( false );
    const [ visionIndex, setVisionIndex ] = useState( 0 );


    const { pathname } = useRouter();

    const onChangeProduct = ( productName ) =>
    {
        setActiveProduct( productName );

        const vision = checkEmptyArray( visionData[ productName ] ) ? "Now" : visionData[ productName ][ 0 ].createdAt;
        setVision( vision );
    };


    const handleActiveVision = ( visionDate ) =>
    {
        const visions = visionData[ activeProduct ];

        const visionIndex = visions.findIndex( v => v.createdAt === visionDate );


        if ( visionIndex > -1 )
        {
            const vision = visions[ visionIndex ];
            setVision( vision.createdAt );
            setVisionIndex( visionIndex );
            setInfo( {} );
            setEditMode( false );
        }


    };

    const handleSubmit = ( info ) =>
    {
        const data =
        {
            createdAt: new Date().toISOString(),
            info
        };

        const newData = { ...visionData };
        newData[ activeProduct ] = [ data, ...newData[ activeProduct ] ];

        setVisionData( newData );
        setVision( newData[ activeProduct ][ 0 ].createdAt );
        setEditMode( false );
        setInfo( {} );
        setVisionIndex( 0 );

    };

    const handleSetInfo = ( info ) =>
    {
        setEditMode( true );
        setInfo( info );
    };




    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy objectives" />
                <link rel="icon" href="/favicon.ico" />
            </Head>



            <AppLayout
                rightNavItems={ generateRightNav( visionData[ activeProduct ] ) }
                activeRightItem={ vision }
                setActiveRightNav={ handleActiveVision }
                hasSideAdd={ false }
                defaultText={ getTimeAgo( vision ) }
                onChangeProduct={ onChangeProduct }
                breadCrumbItems={ splitRoutes( pathname ) }>


                {
                    checkEmptyObject( info ) ? <Deck
                        product={ activeProduct }
                        setInfo={ handleSetInfo }
                        list={ visionData[ activeProduct ] }
                        activeIndex={ visionIndex } /> : null
                }


                {
                    ( inEditMode || !visionData[ activeProduct ].length ) ? <StatementForm
                        info={ info }
                        handleSubmit={ handleSubmit } /> : null
                }



            </AppLayout>
        </div>
    );
}
