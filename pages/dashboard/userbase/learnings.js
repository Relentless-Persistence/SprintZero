import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import
{
    Radio
} from 'antd';

import AppLayout from "../../../components/Dashboard/AppLayout";
import FormCard, { ActionFormCard } from "../../../components/Dashboard/FormCard";
import ItemCard from "../../../components/Dashboard/ItemCard";
import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/learnings.json";
import products from "../../../fakeData/products.json";
import MasonryGrid from "../../../components/Dashboard/MasonryGrid";
import RadioButton from "../../../components/AppRadioBtn";


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

    const [ learningName, setLearningName ] = useState( activeLearning.name );


    const setLearning = ( name, product ) =>
    {
        const learning = data[ product || activeProduct ].find( learning => learning.name === name );

        setActiveLearning( learning );
        setLearningName( learning.name );
    };


    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        const learningName = data[ product ][ 0 ].name;
        setGoal( learningName, product );
        setLearningName( learningName );
        setShowAdd( false );
    };

    const addItem = () =>
    {
        setShowAdd( true );
    };

    const addItemDone = ( item ) =>
    {
        const newData = { ...data };
        const learning = newData[ activeProduct ].find( learning => learning.name === learningName );

        learning?.data.push(
            {
                name: item.title,
                description: item.description
            }
        );

        setData( newData );
        setShowAdd( false );
    };

    const editItem = ( resultIndex, item ) =>
    {
        const newData = { ...data };
        const learning = newData[ activeProduct ].find( learning => learning.name === learningName );

        learning.data[ resultIndex ] = item;
        setData( newData );
    };

    const changeLearningForNew = name =>
    {
        if ( showAdd )
        {
            setLearningName( name );


        }
    };

    const rightNav = getNames( data[ activeProduct ] );


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy learnings" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                onChangeProduct={ setProduct }
                rightNavItems={ rightNav }
                activeRightItem={ activeLearning?.name }
                setActiveRightNav={ setLearning }
                onMainAdd={ addItem }
                hasMainAdd
                hasSideAdd={ false }
                mainClass="mr-[130px]"
                breadCrumbItems={ splitRoutes( pathname ) }>

                <MasonryGrid>
                    {
                        showAdd ?
                            <ActionFormCard
                                className="mb-[16px]"
                                onSubmit={ addItemDone }
                                extraItems={ <Radio.Group
                                    className="mt-[12px] flex justify-end" size="small">

                                    {
                                        rightNav.map( ( opt, i ) => (
                                            <RadioButton
                                                key={ i }
                                                checked={ opt === learningName }
                                                onChange={ () => setLearningName( opt ) }
                                                value={ opt }>
                                                { opt }
                                            </RadioButton>
                                        ) )
                                    }

                                </Radio.Group> }
                            />

                            : null
                    }

                    {
                        activeLearning?.data.map( ( res, i ) => (

                            <ItemCard
                                useBtn
                                key={ i }
                                onEdit={ ( item ) => editItem( i, item ) }
                                item={ res } />
                        ) )
                    }



                </MasonryGrid>





            </AppLayout>
        </div>
    );
}
