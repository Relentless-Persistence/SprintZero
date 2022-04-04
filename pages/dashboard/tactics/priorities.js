import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';

import
{
    Input,
    Drawer,
    Tag,
    Form,
    Avatar,
    Row,
    Col,
    Comment,
    Button,
    List
} from 'antd';
import
{
    SendOutlined,
    FlagOutlined,
    CloseOutlined,
    LikeOutlined,
    DislikeOutlined
} from '@ant-design/icons';

import AppLayout from "../../../components/Dashboard/AppLayout";

import { CardTitle } from "../../../components/Dashboard/CardTitle";
import MainSub from "../../../components/Dashboard/MainSub";
import { scaleToVal, splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/priorities.json";
import products from "../../../fakeData/products.json";

import { DraggableTab, DraggableContainer } from "../../../components/Priorities";
import DrawerSubTitle from "../../../components/Dashboard/DrawerSubTitle";

const { TextArea } = Input;


const getNames = ( goals ) =>
{
    const names = goals.map( g => g.name );

    return names;
};

const comments = [
    {
        actions: [
            <button
                className="mr-[10px] flex justify-between items-center"
                key="like"><LikeOutlined /> 127 </button>,
            <button
                className="mr-[10px] flex justify-between items-center"
                key="dislike"><DislikeOutlined /> 0</button>,
            <span
                className="mr-[10px] flex justify-between items-center"
                key="comment-list-reply-to-0">Reply to</span> ],
        author: 'Han Solo',
        avatar: 'https://joeschmoe.io/api/v1/random',
        content: (
            <p>
                We supply a series of design principles, practical patterns and high quality design
                resources (Sketch and Axure), to help people create their product prototypes beautifully and
                efficiently.
            </p>
        ),

    },
    {
        actions: [
            <button
                className="mr-[10px] flex justify-between items-center"
                key="like"><LikeOutlined /> 127 </button>,
            <button
                className="mr-[10px] flex justify-between items-center"
                key="dislike"><DislikeOutlined /> 0</button>,
            <span
                className="mr-[10px] flex justify-between items-center"
                key="comment-list-reply-to-0">Reply to</span> ],
        author: 'Han Solo',
        avatar: 'https://joeschmoe.io/api/v1/random',
        content: (
            <p>
                We supply a series of design principles, practical patterns and high quality design
                resources (Sketch and Axure), to help people create their product prototypes beautifully and
                efficiently.
            </p>
        ),

    }
];




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
    const [ text, setText ] = useState( "As a user I need to be aware of any issues with the platform so that I can pre-emptivly warn attendees and provide any new contact information to join the meeting" );

    const changeText = e => setText( e.target.value );

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
                    visible={ visible }
                    closable={ false }
                    placement={ "bottom" }
                    height={ 400 }
                    title={
                        <Row>
                            <Col span={ 21 }>

                                <CardTitle className="inline-block mr-[10px]">System Status</CardTitle>
                                <Tag color="#91D5FF">3 points</Tag>
                                <Tag color="#A4DF74">$0.00 Total</Tag>

                                <button className="text-[14px] leading-[16px] text-[#1890FF]">
                                    Edit
                                </button>

                            </Col>

                            <Col span={ 3 }>

                                <p className="inline-block text-[12px] leading-[16px] text-[#A6AE9D] mr-[10px]">
                                    Last modified 2 hrs ago
                                </p>

                                <button className="text-right" onClick={ () => setVisible( false ) }>
                                    <CloseOutlined
                                        color="#8C8C8C"
                                    />
                                </button>
                            </Col>

                        </Row>
                    }
                >


                    <Row gutter={ 63 } className="mt-[15px]">

                        <Col span={ 12 } >
                            <DrawerSubTitle>Features</DrawerSubTitle>

                            <TextArea
                                onChange={ changeText }
                                value={ text }
                                rows={ 4 } />
                        </Col>
                        <Col span={ 11 } >
                            <DrawerSubTitle>Comments</DrawerSubTitle>

                            <List
                                className="comment-list"
                                itemLayout="horizontal"
                                dataSource={ comments }
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
                                                className="inline-flex justify-between items-center"
                                                danger>
                                                <FlagOutlined />
                                                Flag
                                            </Button>
                                        </Form.Item>

                                    </>
                                }
                            />


                        </Col>

                    </Row>


                </Drawer>
            </AppLayout>
        </div>
    );
}
