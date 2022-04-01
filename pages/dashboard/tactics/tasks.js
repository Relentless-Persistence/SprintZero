import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import styled from 'styled-components';

import
{
    Input,
    Drawer,
    Tag,
    Checkbox,
    Form,
    Avatar,
    Row,
    Col,
    Comment,
    Button,
    List,
    DatePicker,
    TimePicker
} from 'antd';
import
{
    SendOutlined,
    FlagOutlined,
    UserOutlined,
} from '@ant-design/icons';


import AppLayout from "../../../components/Dashboard/AppLayout";
import DrawerSubTitle from "../../../components/Dashboard/DrawerSubTitle";
import { CardTitle } from "../../../components/Dashboard/CardTitle";

import { Board } from '../../../components/Boards';
import { Index } from '../../../components/Boards/NumberIndex';

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/tasks.json";
import products from "../../../fakeData/products.json";
import CustomTag from "../../../components/Dashboard/Tag";
import ActionButtons from "../../../components/Personas/ActionButtons";
import ResizeableDrawer from "../../../components/Dashboard/ResizeableDrawer";

const getBoardNames = ( boards ) =>
{
    const boardNames = boards.map( g => g.boardName );

    return boardNames;
};

const { TextArea } = Input;

const SubTasks = styled.div`

    .ant-checkbox-wrapper
    {
        display:flex;
        align-items:center;
        margin-bottom:4px;

    }
    .ant-checkbox-checked .ant-checkbox-inner 
        {
            background: #4A801D;
            border: 1px solid #4A801D;
            border-radius: 2px;
        }
`;



export default function Tasks ()
{
    const { pathname } = useRouter();
    const [ visible, setVisible ] = useState( false );

    const [ data, setData ] = useState( fakeData );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );

    const [ activeBoard, setActiveBoard ] = useState( data[ activeProduct ][ 0 ] );
    const [ activeBoardIndex, setActiveBoardIndex ] = useState( 0 );

    const [ drawerData, setDrawerData ] = useState( {
        subject: "Talk to Dave",
        desc: "Reach out to Dave to make sure that things get go ok",
        date: "",
        time: ""
    } );

    const handleDrawerChange = ( e, key ) =>
    {
        setDrawerData( s => (
            {
                ...s,
                [ key ]: e.target.value
            }
        )

        );
    };

    const handleDrawerDateChange = ( date, dateString ) =>
    {
        setDrawerData( s => (
            {
                ...s,
                date: dateString
            }
        )

        );
    };


    const handleDrawerTimeChange = ( time, timeString ) =>
    {
        setDrawerData( s => (
            {
                ...s,
                time: timeString
            }
        )

        );
    };



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

    const renderCol = ( card, index ) =>
    {

        return <>
            <Index>{ index + 1 }</Index>

            <div onClick={ () => setVisible( true ) }>
                <CustomTag
                    text={ card.title } />

            </div>
        </>;
    };


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy tasks" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                useGrid
                onChangeProduct={ setProduct }
                rightNavItems={ getBoardNames( data[ activeProduct ] ) }
                activeRightItem={ activeBoard?.boardName }
                setActiveRightNav={ setBoard }
                hasMainAdd
                addNewText="Add Task"
                hasSideAdd={ false }
                breadCrumbClass="mr-[112px]"
                sideBarClass="h-[700px]"
                onMainAdd={ () => setVisible( true ) }
                breadCrumbItems={ splitRoutes( pathname ) }>


                <div style={
                    {
                        overflowX: "auto"
                    }
                }>

                    <div style={ {
                        width: "1200px",
                        marginBottom: "20px",
                        paddingRight: "100px"
                    } }>
                        <Board
                            colCount={ 4 }
                            onDrop={ handleDrop }
                            onSwap={ handleSwap }
                            columns={ activeBoard?.columns }
                            renderColumn={ renderCol }
                            columnHeaderRenders={ [ null, null, null ] }
                        />

                    </div>

                </div>



                <ResizeableDrawer
                    visible={ visible }
                    closable={ false }
                    placement={ "bottom" }
                    //height={ 550 }
                    title={
                        <Row>
                            <Col span={ 21 }>

                                <CardTitle className="inline-block mr-[10px]">Task</CardTitle>


                            </Col>

                            <Col span={ 3 }>
                                <div className="flex justify-end">
                                    <ActionButtons
                                        onCancel={ () => setVisible( false ) }
                                        onSubmit={ () => setVisible( false ) }
                                    />
                                </div>
                            </Col>

                        </Row>
                    }
                >


                    <Row gutter={ [ 24, 24 ] } className="mt-[15px]">

                        <Col span={ 8 } >
                            <div>
                                <DrawerSubTitle>Subject</DrawerSubTitle>

                                <Input
                                    className="mb-[24px]"
                                    onChange={ ( e ) => handleDrawerChange( e, "subject" ) }
                                    value={ drawerData.subject } />




                                <DrawerSubTitle>Description</DrawerSubTitle>

                                <TextArea
                                    onChange={ ( e ) => handleDrawerChange( e, "desc" ) }
                                    value={ drawerData.desc }
                                    rows={ 4 } />


                            </div>
                        </Col>
                        <Col span={ 8 } >
                            <DrawerSubTitle>Due</DrawerSubTitle>


                            <div className="mb-[24px]"
                            >
                                <DatePicker
                                    className="mr-[8px]"
                                    onChange={ handleDrawerDateChange } />

                                <TimePicker onChange={ handleDrawerTimeChange } />,


                            </div>

                            <SubTasks>
                                <Checkbox
                                    checked >
                                    Lorem ipsum
                                </Checkbox>
                                <Checkbox >
                                    Amet consectetur adipisicing elit
                                </Checkbox>
                                <Checkbox
                                    checked >
                                    Ipsam repellendus?
                                </Checkbox>
                                <Checkbox
                                    checked >
                                    Inventore perspiciatis ratione
                                </Checkbox>
                            </SubTasks>

                        </Col>
                        <Col span={ 8 } >
                            <DrawerSubTitle>Discussion</DrawerSubTitle>

                            <List
                                className="comment-list"
                                itemLayout="horizontal"
                                dataSource={ [] }
                                renderItem={ item => (
                                    <li>
                                        <Comment
                                            actions={ item.actions }
                                            author={ item.author }
                                            avatar={ item.avatar }
                                            content={ item.content }
                                        />
                                    </li>
                                ) }
                            />

                            <Comment
                                avatar={ <Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" /> }
                                content={
                                    <>
                                        <Form.Item>
                                            <TextArea rows={ 2 } />
                                        </Form.Item>

                                        <Form.Item>
                                            <Button
                                                className="inline-flex justify-between items-center mr-[8px]"
                                                disabled>
                                                <SendOutlined />
                                                Post
                                            </Button>


                                            <Button
                                                className="inline-flex justify-between items-center text-[#4A801D]
                                                border-[#4A801D]"
                                            >
                                                <UserOutlined />
                                                Assign
                                            </Button>
                                        </Form.Item>

                                    </>
                                }
                            />


                        </Col>

                    </Row>

                </ResizeableDrawer >
            </AppLayout>
        </div>
    );
}
