import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';


import AppLayout from "../../../components/Dashboard/AppLayout";
import StatementForm from "../../../components/Vision/StatementForm";

import { checkEmptyArray, getTimeAgo, splitRoutes } from "../../../utils";
import products from "../../../fakeData/products.json";

import fakeData from "../../../fakeData/visionData.json";


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

        const vision = visions.find( v => v.createdAt === visionDate );

        if ( vision )
        {
            setVision( vision.createdAt );

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
                defaultText="Statement"
                onChangeProduct={ onChangeProduct }
                breadCrumbItems={ splitRoutes( pathname ) }>

                {
                    checkEmptyArray( visionData[ activeProduct ] ) ?

                        <StatementForm
                            handleSubmit={ handleSubmit } /> :

                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. A ducimus provident quo error in omnis ea minus dignissimos fugit commodi quibusdam laboriosam itaque minima, debitis voluptatum mollitia nostrum expedita similique.</p>
                }


            </AppLayout>
        </div>
    );
}
