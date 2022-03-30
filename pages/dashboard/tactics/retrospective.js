import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import
{

    Dropdown,
    Card,
    Avatar,
    Divider
} from 'antd';

import
{
    SortAscendingOutlined
} from '@ant-design/icons';

import CardHeaderButton from "../../../components/Dashboard/CardHeaderButton";

import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes } from "../../../utils";

import MasonryGrid from "../../../components/Dashboard/MasonryGrid";

import fakeData from "../../../fakeData/retrospective.json";
import products from "../../../fakeData/products.json";
import { ActionFormCard } from "../../../components/Dashboard/FormCard";
import AddItem from "../../../components/Retrospective/AddItem";


const { Meta } = Card;

const MyCard = styled( Card )`

    position:relative;
   
    .ant-card-body
    {
        padding:0;
    }


    .ant-card-meta
    {
        padding:16px ;

        .ant-card-meta-title
        {
            margin-bottom:0
        }
    }
    
    .ant-divider-horizontal
    {
        margin: 0
    }

    article
    {
        padding:16px 16px 0;

        h5
        {
            font-weight:bold;

        }

        p
        {
            font-style:italic;
        }

    }

`;

const MyBtn = styled( Dropdown.Button )`
   & > button
   {
       background: #fff !important;
   }
`;

export default function Retrospective ()
{
    const { pathname } = useRouter();
    const user = "Arlene McCoy";

    const [ data, setData ] = useState( fakeData );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );
    const [ activeEditIndex, setActiveEditIndex ] = useState( null );

    const [ showAdd, setShowAdd ] = useState( false );

    const [ activeTabIndex, setActiveTabIndex ] = useState( 0 );

    const handleRightNav = ( name ) =>
    {
        const index = data[ activeProduct ].findIndex( card => card.title === name );

        if ( index > -1 )
        {
            setActiveTabIndex( index );
        }

    };

    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        setActiveTabIndex( 0 );

    };

    const onEdit = ( item ) =>
    {
        const newData = { ...data };

        const card = newData[ activeProduct ][ activeTabIndex ].comments[ activeEditIndex ];

        card.title = item.title;
        card.text = item.description;

        setData( newData );

        setActiveEditIndex( null );
    };

    const addRetro = ( dto ) =>
    {
        const newData = { ...data };

        const comments = newData[ activeProduct ][ activeTabIndex ].comments;

        const newComm = {
            "avatar": "https://joeschmoe.io/api/v1/random",
            "role": "Designer",
            name: user,
            title: dto.title,
            text: dto.description,
        };

        newData[ activeProduct ][ activeTabIndex ].comments = [ newComm, ...comments ];


        setData( newData );

        setShowAdd( false );


    };


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero retrospective" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppLayout
                rightNavItems={ [ "Enjoyable", "Puzzling", "Frustrating" ] }
                activeRightItem={ data[ activeProduct ][ activeTabIndex ].title }
                onChangeProduct={ setProduct }
                setActiveRightNav={ handleRightNav }
                mainClass="mr-[128px]"
                hasSideAdd={ false }
                topExtra={ <MyBtn
                    className=""
                    overlay={ <></> }
                    onClick={ () => { } }
                    icon={ <SortAscendingOutlined /> }
                >
                    Sort
                </MyBtn> }
                hasMainAdd
                onMainAdd={ () => setShowAdd( true ) }
                breadCrumbItems={ splitRoutes( pathname ) }>

                { data[ activeProduct ][ activeTabIndex ]?.comments?.length ? <MasonryGrid>
                    {

                        data[ activeProduct ][ activeTabIndex ].comments.map( ( c, i ) => (

                            i === activeEditIndex ? (
                                <>
                                    <ActionFormCard
                                        title={ c.title }
                                        description={ c.text }
                                        className='mb-[16px]'
                                        onCancel={ () => setActiveEditIndex( null ) }
                                        onSubmit={ onEdit }
                                    />
                                </>
                            ) : ( <MyCard
                                className='mb-[16px]'
                                //extra={ user === c.name ? <CardHeaderLink>Edit</CardHeaderLink> : null }
                                key={ i }>
                                <Meta
                                    avatar={ <Avatar
                                        size={ 48 }
                                        src={ c.avatar }
                                        style={ {
                                            border: "2px solid #315613"
                                        } }
                                    /> }
                                    title={ c.name }
                                    description={ c.role }
                                />

                                {
                                    user === c.name ? <CardHeaderButton
                                        onClick={ () => setActiveEditIndex( i ) }
                                        className="absolute top-[28px] right-[16px]" >Edit</CardHeaderButton> : null
                                }

                                <Divider />


                                <article>
                                    <h5>{ c.title }</h5>
                                    <p>{ c.text }</p>
                                </article>

                                <br />
                            </MyCard> )

                        ) )
                    }
                </MasonryGrid> : <h3 className="text-center" >
                    Add Item
                </h3>
                }

                <AddItem
                    show={ showAdd }
                    onSubmit={ addRetro }
                    setShow={ setShowAdd }
                />




            </AppLayout>

        </div>
    );


}
