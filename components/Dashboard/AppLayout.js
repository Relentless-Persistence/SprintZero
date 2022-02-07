import React, { useState } from "react";
import styled from "styled-components";
import
{
    Layout,
    Breadcrumb,
    Typography,
    Input,
    Avatar,
    Divider,
    Button,
} from "antd";
import { useRouter } from 'next/router';
import
{
    MessageFilled,
    PlusOutlined
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";

import SideBar from "./SideBar";

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const HeaderMenu = styled.div`
  color: ${ ( props ) => ( props.active ? "#73c92d" : "#fff" ) };
  cursor: pointer;
  border-bottom-width: 4px;
  border-bottom-style: solid;
  border-bottom-color: ${ ( props ) => ( props.active ? "#73c92d" : "transparent" ) };

  &:hover {
    color: var(--kelly);
    border-bottom: 4px solid var(--kelly);
  }
`;

const Versions = styled.ul`
  list-style: none;
  color: #262626;
  font-size: 16px;
`;

const Version = styled.li`
  padding: 16px 24px;
  border-left-width: 4px;
  border-left-style: solid;
  border-left-color: ${ ( props ) => ( props.active ? "#315613" : "#ccc" ) };
  cursor: pointer;
`;

const AddNew = styled( Button )`
align-items:center;
display:flex;
padding-top:0;
padding-bottom:0;
overflow:hidden;
margin-top:14px;
margin-right:44px;
padding-right:6px;
background:#fff;

`;

const AddSide = styled( Button )`
background:transparent;
border: none;
margin: 5px auto;
color: #009CD5;
box-shadow:none
font-family: SF Pro Text;
font-size: 16px;
line-height: 24px;
`;

const Partition = styled( Divider )`
  height:100px;
`;


const AppLayout = ( {
    rightNavItems,
    products,
    activeProduct,
    activeRightItem = "test",
    breadCrumbItems,
    setActiveRightNav,
    setActiveProduct,
    onMainAdd,
    onSideAdd,
    hasSideAdd = true,
    children } ) =>
{
    const { user } = useAuth();
    const [ showSideAdd, setShowSideAdd ] = useState( false );
    const [ value, setValue ] = useState( "" );

    const toggleSideAdd = () =>
    {
        setShowSideAdd( s => !s );
    };

    const onEnter = ( e ) =>
    {

        if ( e.key === "Enter" && value.trim() )
        {
            onSideAdd( value.trim() );
            toggleSideAdd();
            setValue( "" );

        }
    };

    const handleChange = e =>
    {
        setValue( e.target.value );
    };

    if ( !user ) return <div>Loading...</div>;

    return (
        <Layout style={ { minHeight: "100vh" } }>
            <Header className="header">
                <div className="flex items-center">
                    <Title level={ 2 } className="dashboard-logo m-0">
                        Sprint Zero
                    </Title>
                    <div className="flex items-center ml-11">
                        { products.map( ( item, i ) => (
                            <HeaderMenu key={ i } className="mr-10" active={ activeProduct === item } onClick={ () => setActiveProduct( item ) }>{ item }</HeaderMenu>
                        ) ) }


                    </div>
                </div>
                <div className="flex items-center">
                    <Search
                        placeholder="Search"
                        allowClear
                        className="mr-6 border-none focus:outline-none outline-none"
                        // onSearch={onSearch}
                        style={ { width: 200 } }
                    />
                    <MessageFilled
                        style={ { color: "#73c92d", width: "24px" } }
                        className="mr-6"
                    />
                    <Avatar src={ user.photoURL } style={ { border: "2px solid #73c92d" } } />
                </div>
            </Header>
            <Layout>
                <Sider
                    width={ 200 }
                    className="site-layout-background"
                    breakpoint="sm"
                >
                    <SideBar />
                </Sider>
                <Layout style={ { padding: "0 24px 24px" } }>
                    <div className="flex justify-between">
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <Breadcrumb style={ { margin: "16px 0 0 44px" } }>

                                    {
                                        breadCrumbItems.map( ( item, i ) => (
                                            <Breadcrumb.Item
                                                key={ i }
                                                className="capitalize"
                                            >
                                                { item }
                                            </Breadcrumb.Item>
                                        ) )
                                    }


                                    <Breadcrumb.Item className="capitalize text-green-800 ">
                                        { activeRightItem }
                                    </Breadcrumb.Item>
                                </Breadcrumb>

                                <AddNew onClick={ onMainAdd }>
                                    Add New
                                    <Partition type="vertical" />
                                    <PlusOutlined />
                                </AddNew>
                            </div>

                            <Content
                                style={ {
                                    padding: "24px 44px",
                                    margin: 0,
                                    minHeight: 280,
                                } }
                            >
                                { children }
                            </Content>
                        </div>
                        <div>
                            <div>
                                <Versions className="">
                                    {
                                        rightNavItems.map( ( item, i ) => (
                                            <Version
                                                className="capitalize"
                                                key={ i }
                                                active={ activeRightItem === item }
                                                onClick={ () => setActiveRightNav( item ) }
                                            >
                                                { item }
                                            </Version>
                                        ) )
                                    }


                                    {
                                        ( hasSideAdd && showSideAdd ) ?
                                            <Version> <Input
                                                className="mx-0 my-0"
                                                autoFocus
                                                value={ value }
                                                onChange={ handleChange }
                                                onKeyPress={ onEnter }
                                            />
                                            </Version>
                                            : null
                                    }

                                    {
                                        hasSideAdd ?

                                            <Version>
                                                <AddSide onClick={ toggleSideAdd }>
                                                    Add
                                                </AddSide>
                                            </Version>
                                            : null
                                    }

                                </Versions>



                            </div>
                        </div>
                    </div>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
