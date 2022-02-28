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
    Drawer,
    Radio,
    Checkbox
} from 'antd';
import { LinkOutlined, CloseOutlined } from '@ant-design/icons';


import AppLayout from "../../../components/Dashboard/AppLayout";

import { Board } from '../../../components/Boards/Board2';
import { DropDwnBtn } from '../../../components/Dashboard/DropdownBtn';


import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/ethics.json";
import products from "../../../fakeData/products.json";
import { Title } from "../../../components/Dashboard/SectionTitle";


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



const StyledItem = styled.div`
    color: ${ props => props.$color || "black" };
    border: 1px solid ${ props => props.$color || "black" };
    display:inline-block;
    padding:4px 8px;
    cursor:pointer;

    p
    {
        display:inline-block;
        margin-left:5px;
    }

`;

const Story = styled.p`
   padding:12px 19px;
   background:#F5F5F5;
   color: #262626;
   border: 1px solid #D9D9D9;
`;




const Index = styled.span`
    width:32px;
    height:32px;
    border: 1px solid #101D06;
    background:#fff;
    text-align:center;
    margin:auto;
    border-radius:50%;
    font-size:12px;
    line-height:16px;
    display: flex;
    align-items: center;
    justify-content: center;
`;




export default function Ethics ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );
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
                <StyledItem
                    $color={ card.color }>
                    <span>x</span>

                    <p>
                        { card.title }</p>
                </StyledItem>
            </div>
        </>;
    };


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy ethics" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout
                hideSideBar
                ignoreLast={ true }
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
                    renderColumn={ renderCol }
                    columnHeaderRenders={ [ null, null, <DropDwnBtn key="jjj" value="All" menu={ menu } /> ] }
                />

                <Drawer
                    title={ <DrawerTitle gutter={ [ 12, 12 ] }>
                        <Col span={ 12 }>
                            <h3>card_title</h3>
                            <Tag color="#91D5FF">3 points</Tag>
                            <Tag color="#A4DF74">$1,230</Tag>
                            <Tag
                                icon={ <LinkOutlined /> }
                                color="#096DD9">Design</Tag>
                        </Col>
                        <Col span={ 12 }>
                            <CloseTime>
                                <p>Last modified 2 hrs ago</p>
                                <CloseOutlined
                                    color="#A6AE9D"
                                    onClick={ () => setVisible( false ) } />
                            </CloseTime>
                        </Col>

                    </DrawerTitle> }
                    placement={ "bottom" }
                    closable={ false }
                    onClose={ () => setVisible( false ) }
                    visible={ visible }
                >
                    <Row className="py-6" gutter={ [ 50, 50 ] }>
                        <Col span={ 12 }>

                            <Title>
                                Adjudication Response
                            </Title>


                            <p>Do you think this would provide value and reaffirm the commitment to our users?</p>
                            <br />

                            <Radio.Group
                                options={ [
                                    {
                                        label: "Allow",
                                        value: true
                                    },
                                    {
                                        label: "Deny",
                                        value: false
                                    }
                                ] }
                                optionType={ Checkbox }
                            />
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

                        <Col span={ 12 }>
                            <Title>
                                Comments
                            </Title>

                            <br />

                            <List
                                itemLayout="vertical"
                                dataSource={ list }
                                renderItem={ item => (
                                    <List.Item>
                                        <ListItemMeta
                                            avatar={ <Avatar src="https://joeschmoe.io/api/v1/random" /> }
                                            title={ <ListTitle> { item.title }</ListTitle> }
                                            description={ <SubListTitle> { item.text }</SubListTitle> }
                                        />


                                    </List.Item>
                                ) }
                            />

                            <List.Item>
                                <ListItemMeta
                                    avatar={ <Avatar src="https://joeschmoe.io/api/v1/random" /> }
                                    title={ <TextArea /> }
                                />


                            </List.Item>


                        </Col>

                    </Row>
                </Drawer>
            </AppLayout>
        </div>
    );
}
