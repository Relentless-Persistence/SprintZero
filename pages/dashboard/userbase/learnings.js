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

import fakeData from "../../../fakeData/learnings.json";
import products from "../../../fakeData/products.json";


const getNames = ( learnings ) =>
{
    const names = learnings.map( g => g.name );

    return names;
};


export default function Learnings ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );
    const [ showAdd, setShowAdd ] = useState( false );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ activeLearning, setActiveLearning ] = useState( data[ activeProduct ][ 0 ] );


    const setLearning = ( name, product ) =>
    {
        const learning = data[ product || activeProduct ].find( learning => learning.name === name );

        setActiveLearning( learning );
    };


    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        const learningName = data[ product ][ 0 ].name;
        setGoal( learningName, product );
        setShowAdd( false );
    };

    const addItem = () =>
    {
        setShowAdd( true );
    };

    const addItemDone = ( item ) =>
    {
        const newData = { ...data };
        const learning = newData[ activeProduct ].find( learning => learning.name === activeLearning.name );

        learning?.data.push( item );

        setData( newData );
        setShowAdd( false );
    };

    const editItem = ( resultIndex, item ) =>
    {
        const newData = { ...data };
        const learning = newData[ activeProduct ].find( learning => learning.name === activeLearning.name );

        learning.data[ resultIndex ] = item;
        setData( newData );
    };



    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy learnings" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                onChangeProduct={ setProduct }
                rightNavItems={ getNames( data[ activeProduct ] ) }
                activeRightItem={ activeLearning?.name }
                setActiveRightNav={ setLearning }
                onMainAdd={ addItem }
                hasMainAdd
                hasSideAdd={ false }
                breadCrumbItems={ splitRoutes( pathname ) }>



                <Row className="py-6" gutter={ [ 12, 12 ] }>
                    {
                        activeLearning?.data.map( ( res, i ) => (
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


                </Row>



            </AppLayout>
        </div>
    );
}
