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

import { splitRoutes } from "../../../utils";

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


    const handleTitleChange = ( e ) =>
    {
        const { value } = e.target;

        const newData = { ...data };
        const challengeIndex = data[ activeProduct ].findIndex( challenge => challenge.name === activeChallenge.name );

        newData[ activeProduct ][ challengeIndex ].title = value;

        setData( newData );
    };

    const onClose = () =>
    {
        setVisible( false );
    };

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
                breadCrumbItems={ splitRoutes( pathname ) }>

                <p>{ activeChallenge?.title }</p>



                <Row className="py-6" gutter={ [ 12, 12 ] }>
                    {
                        activeChallenge?.challenges.map( ( res, i ) => (
                            <Col
                                xs={ { span: 24 } }
                                sm={ { span: 12 } }
                                key={ i }>
                                <ItemCard
                                    onEdit={ ( item ) => editItem( i, item ) }
                                    item={ res } />
                            </Col>
                        ) )
                    }



                    {
                        showAdd ? <Col
                            xs={ { span: 24 } }
                            sm={ { span: 12 } }>
                            <FormCard
                                onSubmit={ addItemDone } />
                        </Col> : null
                    }
                    {/* 
                    <Col
                        xs={ { span: 24 } }
                        sm={ { span: 8 } }>
                        <AddCard
                            bordered={ false }
                        >
                            <CardHeaderButton onClick={ addItem }>
                                Add Result
                            </CardHeaderButton>
                        </AddCard>
                    </Col> */}
                </Row>



            </AppLayout>
        </div>
    );
}
