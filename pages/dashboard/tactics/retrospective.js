import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import styled from 'styled-components';
import
{
    Row,
    Col,
    Dropdown,
    Card,
    Avatar,
    Divider
} from 'antd';

import
{
    SortAscendingOutlined
} from '@ant-design/icons';

import AppLayout from "../../../components/Dashboard/AppLayout";

import { splitRoutes } from "../../../utils";

import MasonryGrid from "../../../components/Dashboard/MasonryGrid";

import fakeData from "../../../fakeData/retrospective.json";
import products from "../../../fakeData/products.json";

const { Meta } = Card;

const MyCard = styled( Card )`
   
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

    const [ data, setData ] = useState( fakeData );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

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
                breadCrumbItems={ splitRoutes( pathname ) }>

                <MasonryGrid>
                    {

                        data[ activeProduct ][ activeTabIndex ].comments.map( ( c, i ) => (

                            <MyCard
                                className='mb-[16px]'
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

                                <Divider />

                                <article>
                                    <h5>{ c.title }</h5>
                                    <p>{ c.text }</p>
                                </article>

                                <br />
                            </MyCard>
                        ) )
                    }
                </MasonryGrid>



            </AppLayout>

        </div>
    );


}
