import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';

import { Drawer, Button, Radio, Space } from 'antd';


import AppLayout from "../../../components/Dashboard/AppLayout";

import { CardTitle } from "../../../components/Dashboard/CardTitle";
import MainSub from "../../../components/Dashboard/MainSub";
import { scaleToVal, splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/priorities.json";
import products from "../../../fakeData/products.json";

import { DraggableTab, DraggableContainer } from "../../../components/Priorities";



const getNames = ( goals ) =>
{
    const names = goals.map( g => g.name );

    return names;
};



export default function Priorities ()
{
    const { pathname } = useRouter();
    const container = useRef();


    const [ data, setData ] = useState( fakeData );
    const [ visible, setVisible ] = useState( false );
    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ activePriority, setActivePriority ] = useState( null );
    const [ disableDrag, setDisableDrag ] = useState( true );

    const [ activePriorityIndex, setActivePriorityIndex ] = useState( 0 );

    const setPriority = ( name ) =>
    {
        const activePriorityIndex = data[ activeProduct ].findIndex( card => card.name === name );

        if ( activePriorityIndex > -1 )
        {
            setActivePriorityIndex( activePriorityIndex );
            setActivePriority( data[ activeProduct ][ activePriorityIndex ] );

        }

    };

    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        setActivePriorityIndex( 0 );
        setActivePriority( data[ product ][ 0 ] );
    };

    const toggleDisable = () => setDisableDrag( s => !s );

    const toggleDrawer = ( itemIndex ) => 
    {
        setVisible( s => !s );
    };

    const onStop = ( e, itemData, index ) =>
    {
        const node = itemData.node.getBoundingClientRect();
        const nodeWidth = node.width;
        const nodeHeight = node.height;

        const parent = container?.current.getBoundingClientRect();
        const parentWidth = parent.width;
        const parentHeight = parent.height;


        const maxPossibleX = parentWidth - nodeWidth;
        const maxPossibleY = parentHeight - nodeHeight;

        const valX = scaleToVal( itemData.x, maxPossibleX );
        const valY = scaleToVal( itemData.y, maxPossibleY );

        const newData = { ...data };

        const list = newData[ activeProduct ][ activePriorityIndex ];

        //flip Y cuz graph y axiz is opposite to screen y axes

        list.data[ index ] =
        {
            ...list.data[ index ],
            feasiblity: valX,
            value: 100 - valY,
        };


        newData[ activeProduct ][ activePriorityIndex ] = list;
        setData( newData );


    };

    useEffect( () =>
    {

        if ( !activePriority )
        {
            setActivePriority( data[ activeProduct ][ 0 ] );
        }

    }, [ activePriority, data, activeProduct ] );



    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy tasks" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                rightNavItems={ getNames( data[ activeProduct ] ) }
                onChangeProduct={ setProduct }
                hasSideAdd={ false }
                activeRightItem={ activePriority?.name }
                setActiveRightNav={ setPriority }
                breadCrumbItems={ splitRoutes( pathname ) }
                hasMainAdd
                addNewText={ disableDrag ? "Edit" : "Done" }

                onMainAdd={ toggleDisable }
            >



                <MainSub>
                    Assess the practicality of proposed items to objectively and rationally uncover strengths and weaknesses, opportunities and threats, the resources required to carry through, and ultimately the prospects for success
                </MainSub>

                <DraggableContainer
                    disable={ disableDrag }
                    ref={ container }>

                    {
                        activePriority?.data.map( ( d, i ) => <DraggableTab
                            onStop={ onStop }
                            ref={ container }
                            label={ d.label }
                            disable={ disableDrag }
                            index={ i }
                            onClickItem={ toggleDrawer }
                            val={
                                {
                                    x: d.feasiblity,
                                    y: d.value
                                } }
                            key={ d.id } /> )
                    }

                </DraggableContainer>

                <Drawer
                    title={ <CardTitle>System Status</CardTitle> }
                    placement="bottom"
                    closable={ false }
                    visible={ visible }
                >
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                </Drawer>
            </AppLayout>
        </div>
    );
}
