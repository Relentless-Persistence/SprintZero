import React, { useState } from "react";
import styled from "styled-components";
import { Layout, Breadcrumb, Typography, Input, Avatar } from "antd";
import { useRouter } from 'next/router';
import
{
    MessageFilled,
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


const AppLayout = ( {
    rightNavItems,
    products,
    activeProduct,
    activeRightItem = "test",
    breadCrumbItems,
    setActiveRightNav,
    setActiveProduct,
    children } ) =>
{
    const router = useRouter();
    const { user } = useAuth();
    const [ collapsed, setCollapsed ] = useState( false );
    const [ version, setVersion ] = useState( "All" );
    const [ product, setProduct ] = useState( products[ 0 ] );

    const onCollapse = ( collapsed ) =>
    {
        setCollapsed( collapsed );
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
                                                key={ i }
                                                active={ activeRightItem === item }
                                                onClick={ () => setActiveRightNav( item ) }
                                            >
                                                { item }
                                            </Version>
                                        ) )
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
