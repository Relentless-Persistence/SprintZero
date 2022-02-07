import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';

import styled from 'styled-components';

import
{
    Row,
    Col,
    Avatar,
    Card,
    Divider
} from 'antd';

import AppLayout from "../../../components/Dashboard/AppLayout";
import FormCard from "../../../components/Dashboard/FormCard";
import ItemCard from "../../../components/Dashboard/ItemCard";

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/partnerships.json";
import products from "../../../fakeData/products.json";

const getGoalNames = ( goals ) =>
{
    const goalNames = goals.map( g => g.name );

    return goalNames;
};

const Pcard = styled( Card )`
.ant-card-body
{
    padding:0
}
`;

const tabList = [ "active", "prospective", "historical" ];

export default function Partnerships ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );
    const [ showAdd, setShowAdd ] = useState( false );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ activePartner, setActivePartner ] = useState( tabList[ 0 ] );



    const setActiveTabItem = ( tabName ) =>
    {
        setActivePartner( tabName );
    };


    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        const goalName = data[ product ][ 0 ].name;
        setGoal( goalName, product );
        setShowAdd( false );
    };

    const addItem = () =>
    {
        setShowAdd( true );
    };


    const addItemDone = ( item ) =>
    {
        const body =
        {
            "logo": "/fakeImages/google.png",
            "name": "Google",
            "category": "Third Party Auth",
            "costText": ".04 cents per event"
        };
        const newData = { ...data };
        newData[ activeProduct ][ activePartner ].push( body );


        setData( newData );
        setShowAdd( false );
    };


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy objectives" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                products={ products }
                setActiveProduct={ setProduct }
                rightNavItems={ tabList }
                activeProduct={ activeProduct }
                activeRightItem={ activePartner }
                setActiveRightNav={ setActiveTabItem }
                onMainAdd={ addItem }
                breadCrumbItems={ splitRoutes( pathname ) }>




                <Row className="py-6" gutter={ [ 12, 12 ] }>
                    {/* {
                        activeGoal?.results.map( ( res, i ) => (
                            <Col
                                xs={ { span: 24 } }
                                sm={ { span: 8 } }
                                key={ i }>
                                <ItemCard
                                    onEdit={ ( item ) => editItem( i, item ) }
                                    item={ res } />
                            </Col>
                        ) )
                    } */}

                    {
                        data[ activeProduct ][ activePartner ].map(
                            ( p, i ) => (
                                <Col
                                    xs={ { span: 24 } }
                                    sm={ { span: 8 } }
                                    key={ i }>
                                    <Pcard>
                                        <div className="px-4 pt-5 pb-0 flex items-center">
                                            <Avatar
                                                size={ 48 }
                                                src={ p.logo } />

                                            <div className=" ml-3">
                                                <p><strong>{ p.name }</strong></p>

                                                <p className="text-gray-400" >{ p.category }</p>
                                            </div>
                                        </div>
                                        <Divider className="mt-3" />
                                        <div className="px-5 pb-5" >
                                            <p><strong>Cost</strong></p>

                                            <p>
                                                { p.costText }
                                            </p>

                                        </div>

                                    </Pcard>
                                </Col>
                            )
                        )
                    }



                    {
                        showAdd ? <Col
                            xs={ { span: 24 } }
                            sm={ { span: 8 } }>
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
