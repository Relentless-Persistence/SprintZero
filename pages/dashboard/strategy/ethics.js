import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import
{
    Row,
    Col,
} from 'antd';

import AppLayout from "../../../components/Dashboard/AppLayout";

import { Board } from '../../../components/Boards';

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/ethics.json";
import products from "../../../fakeData/products.json";


const getBoardNames = ( boards ) =>
{
    const boardNames = boards.map( g => g.boardName );

    return boardNames;
};


export default function Ethics ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ activeBoard, setActiveBoard ] = useState( data[ activeProduct ][ 0 ] );
    const [ activeBoardIndex, setActiveBoardIndex ] = useState( 0 );


    const setBoard = ( boardName, product ) =>
    {
        const boardIndex = data[ product || activeProduct ].findIndex( b => b.boardName === boardName );

        if ( boardIndex > -1 )
        {

            setActiveBoard( data[ product || activeProduct ][ boardIndex ] );
            setActiveBoardIndex( boardIndex );
        }
    };


    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        const boardName = data[ product ][ 0 ]?.boardName;
        setBoard( boardName, product );

    };

    const handleDrop = ( card, targetColId ) =>
    {

        const info = { ...data };
        const newData = info[ activeProduct ][ activeBoardIndex ];
        const cardIndex = newData?.columns[ card.colId ]?.data?.findIndex( c => c.id === card.id );


        if ( cardIndex > -1 )
        {

            const cardInfo = newData.columns[ card.colId ].data[ cardIndex ];
            const newColumn = newData?.columns?.findIndex( col => col.columnId === targetColId );

            if ( !newData.columns[ newColumn ].data || !newData.columns[ newColumn ].data.length )
            {
                newData.columns[ newColumn ].data = [ cardInfo ];
            }
            else
            {
                newData.columns[ newColumn ].data = [ ...newData.columns[ newColumn ].data, cardInfo ];

            }

            newData.columns[ card.colId ].data = newData.columns[ card.colId ].data.filter( ( _, i ) => i !== cardIndex );


        }

        info[ activeProduct ][ activeBoardIndex ] = newData;

        setData( info );

    };


    const handleSwap = ( currentCard, targetCard ) =>
    {

        const info = { ...data };
        const newData = info[ activeProduct ][ activeBoardIndex ];
        const columns = newData?.columns;



        const currentCardColumn = columns.find( c => c.columnId === currentCard.colId );
        const targetCardColumn = columns.find( c => c.columnId === targetCard.colId );

        const currentCardIndex = currentCardColumn?.data?.findIndex( c => c.id === currentCard.id );
        const targetCardIndex = targetCardColumn?.data?.findIndex( c => c.id === targetCard.id );


        //swap cards
        if ( currentCard.colId === targetCard.colId )
        {

            [ currentCardColumn.data[ currentCardIndex ],
            targetCardColumn.data[ targetCardIndex ]
            ] = [ targetCardColumn.data[ targetCardIndex ], currentCardColumn.data[ currentCardIndex ]
                ];
        }
        else
        {
            //fake drop
            handleDrop( currentCard, targetCard.colId );
        }



        setData( info );

    };


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy ethics" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                onChangeProduct={ setProduct }
                rightNavItems={ getBoardNames( data[ activeProduct ] ) }
                activeRightItem={ activeBoard?.boardName }
                setActiveRightNav={ setBoard }
                hasMainAdd={ false }
                hasSideAdd={ false }
                breadCrumbItems={ splitRoutes( pathname ) }>


                <Board
                    onDrop={ handleDrop }
                    onSwap={ handleSwap }
                    columns={ activeBoard?.columns }
                />

            </AppLayout>
        </div>
    );
}
