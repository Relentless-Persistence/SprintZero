import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import styled from "styled-components";


import
{
    List,
    Avatar,
    Menu,
    Input,
    Row,
    Tag,
    Col,
    Button,
    Drawer,
    Comment,
    Form,
} from 'antd';
import
{
    DislikeOutlined,
    LikeOutlined,
    LinkOutlined,
    CloseOutlined,
    FlagOutlined,
    SendOutlined
} from '@ant-design/icons';

import AppLayout from "../../../components/Dashboard/AppLayout";

import { Board } from '../../../components/Boards';
import { Index } from '../../../components/Boards/NumberIndex';

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/ethics.json";
import products from "../../../fakeData/products.json";
import { Title } from "../../../components/Dashboard/SectionTitle";
import CustomTag from "../../../components/Dashboard/Tag";
import AppCheckbox from "../../../components/AppCheckbox";


const { TextArea } = Input;

const list = [
    {
        title: 'Han Solo',
        text: "Authoritatively disseminate prospective leadership via opportunities economically sound."
    },
    {
        title: 'Kim James',
        text: "Is this really want we think the story should be? "
    }
];

const getBoardNames = ( boards ) =>
{
    const boardNames = boards.map( g => g.boardName );

    return boardNames;
};

const menu = (
    <Menu>
        <Menu.Item key="1">
            All
        </Menu.Item>
        <Menu.Item key="2">
            Allowed
        </Menu.Item>
        <Menu.Item key="3">
            Rejected
        </Menu.Item>
    </Menu>
);

const ListItemMeta = styled( List.Item.Meta )`


.ant-list-item-meta-title
{
    margin-bottom:0;
}
`;

const ListTitle = styled.p`
   color: #8C8C8C;
   font-size: 12px;
line-height: 16px;
`;

const SubListTitle = styled.p`
font-size: 14px;
line-height: 22px;
color: #262626;
`;


const StyledTag = styled( Tag )`
background: #F5F5F5;
border: ${ props => props.$border ? "1px solid #BFBFBF" : "" };
color: ${ props => props.$textColor || "#262626" } !important;
font-weight: 600;
font-size: 14px;
line-height: 22px;
`;


const DrawerTitle = styled( Row )`
    h3
    {
        font-weight: 600;
        font-size: 20px;
        line-height: 28px;
        display:inline-block;
        margin-right:10px;
        color: #262626;
    }
`;

const CloseTime = styled.p`
   display:flex;
   justify-content: flex-end;
   align-items:center;

   p
   {
       color: #A6AE9D;
   }
`;



const Story = styled.p`
   padding:12px 19px;
   background:#F5F5F5;
   color: #262626;
   border: 1px solid #D9D9D9;
`;


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









export default function Ethics ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );
    const [ allow, setAllow ] = useState( "" );
    const [ visible, setVisible ] = useState( false );

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

    const renderCol = ( card, index ) =>
    {

        return <>
            <Index>{ index + 1 }</Index>

            <div onClick={ () => setVisible( true ) }>
                <CustomTag
                    type={ index % 2 === 0 ? "feature" : "epic" }
                    text={ card.title } />
                {/* <StyledItem
                    $color={ card.color }>
                    <span>x</span>

                    <p>
                        { card.title }</p>
                </StyledItem> */}
            </div>
        </>;
    };


    return (
        <div>
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy ethics" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                ignoreLast={ true }
                onChangeProduct={ setProduct }
                rightNavItems={ getBoardNames( data[ activeProduct ] ) }
                activeRightItem={ activeBoard?.boardName }
                setActiveRightNav={ setBoard }
                hasMainAdd={ false }
                hasSideAdd={ false }
                hideSideBar
                breadCrumbItems={ splitRoutes( pathname ) }>



                <Board
                    onDrop={ handleDrop }
                    onSwap={ handleSwap }
                    columns={ activeBoard?.columns }
                    renderColumn={ renderCol }
                    maxWidthClass="max-w-[1200px]"

                />

                <Drawer
                    height="412px"
                    title={ <DrawerTitle gutter={ [ 16, 16 ] }>
                        <Col span={ 12 }>
                            <h3>card_title</h3>
                            <StyledTag color="#91D5FF">3 points</StyledTag>
                            <StyledTag color="#A4DF74">$1,230</StyledTag>
                            <StyledTag
                                icon={ <LinkOutlined /> }
                                color="#096DD9">Design</StyledTag>
                            <StyledTag
                                $border
                                $textColor="#BFBFBF"
                                icon={ <LinkOutlined style={ {
                                    color: "#BFBFBF"
                                } } /> }>
                                Code
                            </StyledTag>
                        </Col>
                        <Col
                            className="flex items-center justify-end"
                            span={ 12 }>
                            <CloseTime>
                                <p className="text-[12px] mr-[11px] leading-[16px] !text-[#101D06]">Last modified 2 hrs ago</p>
                                <CloseOutlined
                                    style={ {
                                        color: "#101D06",
                                        fontSize: "12px"
                                    } }
                                    onClick={ () => setVisible( false ) } />
                            </CloseTime>
                        </Col>

                    </DrawerTitle> }
                    placement={ "bottom" }
                    closable={ false }
                    onClose={ () => setVisible( false ) }
                    visible={ visible }
                >
                    <Row className="py-6" gutter={ [ 16, 16 ] }>
                        <Col span={ 12 }>

                            <Title>
                                Adjudication Response
                            </Title>


                            <p>Do you think this would provide value and reaffirm the commitment to our users?</p>
                            <br />



                            <AppCheckbox
                                checked={ allow }
                                onChange={ () => setAllow( true ) }
                            >Allow</AppCheckbox>
                            <AppCheckbox
                                checked={ !allow }
                                onChange={ () => setAllow( false ) }
                            >Reject</AppCheckbox>


                            <br />
                            <br />

                            <Title>
                                User Story
                            </Title>

                            <br />
                            <Story>
                                As a user I need to be aware of any issues with the platform so that I can pre-emptively warn attendees and provide any new contact information to join the meeting
                            </Story>


                        </Col>

                        <Col
                            offset={ 1 }
                            className="max-h-[250px] overflow-y-scroll"
                            span={ 11 }>
                            <Title>
                                Comments
                            </Title>

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
