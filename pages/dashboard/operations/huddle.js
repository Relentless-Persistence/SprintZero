import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import
{
    Row,
    Col,
    Card,
    Checkbox,
    Avatar
} from 'antd';

import AppLayout from "../../../components/Dashboard/AppLayout";
import FormCard from "../../../components/Dashboard/FormCard";
import ItemCard from "../../../components/Dashboard/ItemCard";

import { splitRoutes, getTimeAgo } from "../../../utils";

import fakeData from "../../../fakeData/huddleData.json";
import products from "../../../fakeData/products.json";
import styled from "styled-components";

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


const MyCard = styled( Card )`
    .ant-card-meta-title
    {
        margin-bottom:0 !important;
    }

    .section
    {
        margin-bottom:20px;
        h4
        {
            font-weight: 600;
            font-size: 16px;
            line-height: 24px;
            margin-bottom:5px;
        }

        .ant-checkbox-checked .ant-checkbox-inner 
        {
            background: #4A801D;
            border: 1px solid #4A801D;
            border-radius: 2px;
        }
    }
`;


export default function Huddle ()
{
    const { pathname } = useRouter();
    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );


    const [ data, setData ] = useState( fakeData );
    const [ activeTimeIndex, setActiveTimeIndex ] = useState( 0 );
    const [ activeTime, setActiveTime ] = useState( data[ activeProduct ][ activeTimeIndex ] );

    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        setActiveTimeIndex( 0 );
        setActiveTime( data[ product ][ 0 ] );
    };

    const setActiveRightNav = ( date ) =>
    {
        const activeData = data[ activeProduct ];

        const huddleIndex = activeData.findIndex( h => h.createdAt === date );


        if ( huddleIndex > -1 )
        {
            const huddle = activeData[ huddleIndex ];
            setActiveTime( huddle );
            setActiveTimeIndex( huddleIndex );

        }
    };

    const handleCheck = ( itemIndex, sectionKey, cardIndex ) =>
    {
        const newData = { ...data };
        const activeData = newData[ activeProduct ];
        const comments = activeData[ activeTimeIndex ].comments;


        comments[ cardIndex ].data[ sectionKey ][ itemIndex ].complete = !comments[ cardIndex ].data[ sectionKey ][ itemIndex ].complete;

        setData( newData );



    };

    const rightNav = generateRightNav( data[ activeProduct ] );


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy huddle" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppLayout
                onChangeProduct={ setProduct }
                hasSideAdd={ false }
                defaultText={ getTimeAgo( new Date( activeTime.createdAt ) ) }
                rightNavItems={ rightNav }
                setActiveRightNav={ setActiveRightNav }
                activeRightItem={ activeTime.createdAt }
                breadCrumbItems={ splitRoutes( pathname ) }>

                <Row className="py-6" gutter={ [ 12, 12 ] }>

                    {
                        activeTime?.comments?.map( ( c, index ) => (
                            <Col key={ index } span={ 8 }>
                                <MyCard title={ <Card.Meta
                                    avatar={ <Avatar
                                        size={ 48 }
                                        src={ c.avatar }
                                        style={ {
                                            border: "2px solid #315613"
                                        } }
                                    /> }
                                    title={ c.name }
                                    description={ c.role }
                                /> }>


                                    <section>

                                        <div className="section">
                                            <h4>Blockers</h4>
                                            <ul>
                                                {
                                                    c.data?.blockers.map( ( d, i ) => (
                                                        <li key={ i }>
                                                            <Checkbox
                                                                onChange={ () => handleCheck( i, "blockers", index ) }
                                                                checked={ d.complete } >
                                                                {
                                                                    d.complete ? <strike>
                                                                        { d.text }
                                                                    </strike> : d.text
                                                                }
                                                            </Checkbox>
                                                        </li>
                                                    ) )
                                                }
                                            </ul>
                                        </div>

                                        <div className="section">
                                            <h4>Today</h4>
                                            <ul>
                                                {
                                                    c.data?.today?.map( ( d, i ) => (
                                                        <li key={ i }>
                                                            <Checkbox onChange={ () => handleCheck( i, "today", index ) }
                                                                checked={ d.complete } >{
                                                                    d.complete ? <strike>
                                                                        { d.text }
                                                                    </strike> : d.text
                                                                }</Checkbox>
                                                        </li>
                                                    ) )
                                                }
                                            </ul>
                                        </div>

                                        <div className="section">
                                            <h4>Yesterday</h4>
                                            <ul>
                                                {
                                                    c.data?.yesterday?.map( ( d, i ) => (
                                                        <li key={ i }>
                                                            <Checkbox onChange={ () => handleCheck( i, "yesterday", index ) }
                                                                checked={ d.complete } >{
                                                                    d.complete ? <strike>
                                                                        { d.text }
                                                                    </strike> : d.text
                                                                }</Checkbox>
                                                        </li>
                                                    ) )
                                                }
                                            </ul>
                                        </div>

                                    </section>
                                </MyCard>
                            </Col>
                        ) )
                    }

                </Row>

            </AppLayout>
        </div>
    );
}
