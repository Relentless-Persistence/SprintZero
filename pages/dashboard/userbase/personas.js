import React, { useState, useReducer } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import
{
    Row,
    Col,
} from 'antd';

import AppLayout from "../../../components/Dashboard/AppLayout";
import
{
    ListCard,
    DescriptionCard,
    TimeLineCard
} from '../../../components/Personas';
import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/personas.json";
import products from "../../../fakeData/products.json";

const getRoles = data => 
{
    return data.map( d => d.title );
};

const getCardData = ( name, data ) =>
{
    return [ ...data?.find( d => d.name === name )?.list ];
};

export default function Personas ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ activeRole, setActiveRole ] = useState( data[ activeProduct ][ 0 ] );

    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        setActiveRole( data[ product ][ 0 ] );
    };

    const setRole = ( roleName ) =>
    {
        const roleIndex = data[ activeProduct ].findIndex( r => r.title === roleName );

        if ( roleIndex > -1 )
        {
            setActiveRole( data[ activeProduct ][ roleIndex ] );
        }
    };

    const createRole = ( roleName ) =>
    {
        const newRole =
        {
            id: new Date().getTime(),
            title: `${ roleName[ 0 ].toUpperCase() }${ roleName.substring( 1 ).toLowerCase() }`,
            cards:
                [
                    {
                        name: "Goals",
                        list: [ "" ]

                    },
                    {
                        name: "Interactions",
                        list: [ "" ]

                    },
                    {
                        name: "Tasks",
                        list: [ "" ]

                    },
                    {
                        name: "Responsiblities",
                        list: [ "" ]

                    },
                    {
                        name: "Description",
                        list: [ "" ]
                    },
                    {
                        name: "A Day in the life",
                        list: [ "" ]
                    }
                ]
        };

        const newData = { ...data };
        newData[ activeProduct ].push( newRole );
        setData( newData );

        setRole( `${ roleName[ 0 ].toUpperCase() }${ roleName.substring( 1 ).toLowerCase() }` );

    };

    const handleEdit = ( roleName, cardName, list ) =>
    {
        const newData = { ...data };
        const roleIndex = newData[ activeProduct ].findIndex( r => r.title === roleName );

        if ( roleIndex > -1 )
        {
            const cardIndex = newData[ activeProduct ][ roleIndex ].cards.findIndex( c => c.name === cardName );

            if ( cardIndex > -1 )
            {
                newData[ activeProduct ][ roleIndex ].cards[ cardIndex ].list = list;
            }

            setData( newData );


        }

    };

    const handleDescription = ( roleName, value ) =>
    {
        const newData = { ...data };
        const roleIndex = newData[ activeProduct ].findIndex( r => r.title === roleName );

        if ( roleIndex > -1 )
        {
            const cardIndex = newData[ activeProduct ][ roleIndex ].cards.findIndex( c => c.name === "Description" );

            if ( cardIndex > -1 )
            {
                newData[ activeProduct ][ roleIndex ].cards[ cardIndex ].list = [ value ];
            }

            setData( newData );


        }

    };


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero personas" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppLayout
                rightNavItems={ getRoles( data[ activeProduct ] ) }
                breadCrumbItems={ splitRoutes( pathname ) }
                onChangeProduct={ setProduct }
                activeRightItem={ activeRole?.title }
                capitalizeText={ false }
                setActiveRightNav={ setRole }
                onSideAdd={ createRole }
                hasSideAdd
                type="text"

            >

                <Row className="py-6" gutter={ [ 12, 12 ] }>
                    <Col
                        xs={ { span: 24 } }
                        sm={ { span: 12 } }>

                        <ListCard
                            handleEdit={ ( list ) => handleEdit( activeRole?.title, "Goals", list ) }
                            title="Goals"
                            name={ activeRole?.id }
                            cardData={ getCardData( "Goals", activeRole?.cards ) }
                        />

                        <br />

                        <ListCard
                            handleEdit={ ( list ) => handleEdit( activeRole?.title, "Interactions", list ) }
                            name={ activeRole?.id }
                            title="Interactions"
                            cardData={ getCardData( "Interactions", activeRole?.cards ) }
                        />


                        <br />

                        <ListCard
                            handleEdit={ ( list ) => handleEdit( activeRole?.title, "Tasks", list ) }
                            title="Tasks"
                            cardData={ getCardData( "Tasks", activeRole?.cards ) }
                            name={ activeRole?.id }

                        />


                        <br />

                        <ListCard
                            handleEdit={ ( list ) => handleEdit( activeRole?.title, "Responsiblities", list ) }
                            title="Responsiblities"
                            cardData={ getCardData( "Responsiblities", activeRole?.cards ) }
                            name={ activeRole?.id }

                        />



                    </Col>
                    <Col
                        xs={ { span: 24 } }
                        sm={ { span: 12 } }>

                        <DescriptionCard
                            handleEdit={ ( value ) => handleDescription( activeRole?.title, value ) }
                            title="Description"
                            name={ activeRole?.id }

                            cardData={ getCardData( "Description", activeRole?.cards ) }
                        />

                        <br />

                        <TimeLineCard
                            handleEdit={ ( list ) => handleEdit( activeRole?.title, "A Day in the life", list ) }
                            title="A Day in the life"
                            name={ activeRole?.id }

                            cardData={ getCardData( "A Day in the life", activeRole?.cards ) } />

                    </Col>
                </Row>

            </AppLayout>


        </div>
    );
}
