import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import
{
    Button,
    Row,
    Col,
    Card,
    Drawer,
    Space,
    Input
} from 'antd';

import AppLayout from "../../../components/Dashboard/AppLayout";
import FormCard from "../../../components/Dashboard/FormCard";
import ItemCard from "../../../components/Dashboard/ItemCard";

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/productData.json";


const getGoalNames = ( goals ) =>
{
    const goalNames = goals.map( g => g.name );

    return goalNames;
};

const products = [ "Insight Meeting", "Alpha Sheet" ];


export default function Objectives ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );
    const [ showAdd, setShowAdd ] = useState( false );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ activeGoal, setActiveGoal ] = useState( data[ activeProduct ][ 0 ] );

    const [ visible, setVisible ] = useState( false );

    const showDrawer = () =>
    {
        setVisible( true );
    };

    const handleTitleChange = ( e ) =>
    {
        const { value } = e.target;

        const newData = { ...data };
        const goalIndex = data[ activeProduct ].findIndex( goal => goal.name === activeGoal.name );

        newData[ activeProduct ][ goalIndex ].title = value;

        setData( newData );
    };

    const onClose = () =>
    {
        setVisible( false );
    };

    const setGoal = ( goalName, product ) =>
    {
        const goal = data[ product || activeProduct ].find( goal => goal.name === goalName );

        setActiveGoal( goal );
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
        const newData = { ...data };
        const goal = newData[ activeProduct ].find( goal => goal.name === activeGoal.name );

        goal?.results.push( item );

        setData( newData );
        setShowAdd( false );
    };

    const editItem = ( resultIndex, item ) =>
    {
        const newData = { ...data };
        const goal = newData[ activeProduct ].find( goal => goal.name === activeGoal.name );

        goal.results[ resultIndex ] = item;
        setData( newData );
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
                rightNavItems={ getGoalNames( data[ activeProduct ] ) }
                activeProduct={ activeProduct }
                activeRightItem={ activeGoal?.name }
                setActiveRightNav={ setGoal }
                onMainAdd={ addItem }
                breadCrumbItems={ splitRoutes( pathname ) }>

                <Input
                    onChange={ handleTitleChange }
                    value={ activeGoal?.title } />


                <Row className="py-6" gutter={ [ 12, 12 ] }>
                    {
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

                <Drawer
                    title={ activeGoal?.title }
                    placement={ "right" }
                    width={ 230 }
                    onClose={ onClose }
                    visible={ visible }
                    extra={
                        <Space>
                            <Button onClick={ onClose }>Cancel</Button>
                        </Space>
                    }
                >
                    <h3>Some contents...</h3>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                </Drawer>

            </AppLayout>
        </div>
    );
}
