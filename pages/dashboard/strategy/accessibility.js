import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import
{
    Row,
    Col,
} from 'antd';

import AppLayout from "../../../components/Dashboard/AppLayout";
import FormCard from "../../../components/Dashboard/FormCard";
import ItemCard from "../../../components/Dashboard/ItemCard";
import MainSub from "../../../components/Dashboard/MainSub";
import { splitRoutes } from "../../../utils";
import MasonryGrid from "../../../components/Dashboard/MasonryGrid";

import fakeData from "../../../fakeData/accessiblity.json";
import products from "../../../fakeData/products.json";


const getChallengeNames = ( challenges ) =>
{
    const challengeNames = challenges.map( g => g.name );

    return challengeNames;
};


export default function Accessiblity ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );
    const [ showAdd, setShowAdd ] = useState( false );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ activeChallenge, setActiveChallenge ] = useState( data[ activeProduct ][ 0 ] );


    const setChallenge = ( challengeName, product ) =>
    {
        const challenge = data[ product || activeProduct ].find( challenge => challenge.name === challengeName );

        setActiveChallenge( challenge );
    };


    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        const challengeName = data[ product ][ 0 ].name;
        setChallenge( challengeName, product );
        setShowAdd( false );
    };

    const addItem = () =>
    {
        setShowAdd( true );
        window?.scrollTo( {
            top: 2 * document?.body?.scrollHeight,
            behavior: 'smooth'
        } );
    };

    const addItemDone = ( item ) =>
    {
        const newData = { ...data };
        const challenge = newData[ activeProduct ].find( challenge => challenge.name === activeChallenge.name );

        challenge?.challenges.push( item );

        setData( newData );
        setShowAdd( false );

    };

    const editItem = ( resultIndex, item ) =>
    {
        const newData = { ...data };
        const challenge = newData[ activeProduct ].find( challenge => challenge.name === activeChallenge.name );

        challenge.challenges[ resultIndex ] = item;
        setData( newData );
    };



    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy accessiblity" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                onChangeProduct={ setProduct }
                rightNavItems={ getChallengeNames( data[ activeProduct ] ) }
                activeRightItem={ activeChallenge?.name }
                setActiveRightNav={ setChallenge }
                hasMainAdd={ true }
                onMainAdd={ addItem }
                hasSideAdd={ false }
                breadCrumbItems={ splitRoutes( pathname ) }
                mainClass="mr-[174px]"
            >

                <MainSub>
                    { activeChallenge?.title }
                </MainSub>

                <MasonryGrid>


                    {
                        activeChallenge?.challenges.map( ( res, i ) => (

                            <ItemCard
                                key={ i }
                                onEdit={ ( item ) => editItem( i, item ) }
                                item={ res } />
                        ) )
                    }


                    {
                        showAdd ?
                            <FormCard
                                onSubmit={ addItemDone } />
                            : null
                    }


                </MasonryGrid>


            </AppLayout>
        </div>
    );
}
