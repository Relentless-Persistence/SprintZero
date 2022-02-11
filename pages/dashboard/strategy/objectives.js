import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import
{
    Row,
    Col,
    Input
} from 'antd';

import AppLayout from "../../../components/Dashboard/AppLayout";
import FormCard from "../../../components/Dashboard/FormCard";
import ItemCard from "../../../components/Dashboard/ItemCard";

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/productData.json";
import products from "../../../fakeData/products.json";


const getGoalNames = ( goals ) =>
{
    const goalNames = goals.map( g => g.name );

    return goalNames;
};


export default function Objectives ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );
    const [ showAdd, setShowAdd ] = useState( false );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ activeGoal, setActiveGoal ] = useState( data[ activeProduct ][ 0 ] );


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


    const onAddGoal = ( name ) =>
    {
        const newData = { ...data };
        const goal =
        {
            name: String( name ).padStart( 3, '0' ),
            title: String( name ).padStart( 3, '0' ),
            results: []
        };
        newData[ activeProduct ].push( goal );

        setData( newData );
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
                onChangeProduct={ setProduct }
                rightNavItems={ getGoalNames( data[ activeProduct ] ) }
                activeRightItem={ activeGoal?.name }
                setActiveRightNav={ setGoal }
                onMainAdd={ addItem }
                onSideAdd={ onAddGoal }
                hasMainAdd
                breadCrumbItems={ splitRoutes( pathname ) }>

                <Input
                    maxLength={ 80 }
                    onChange={ handleTitleChange }
                    value={ activeGoal?.title } />


                <Row className="py-6" gutter={ [ 12, 12 ] }>
                    {
                        activeGoal?.results.map( ( res, i ) => (
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
