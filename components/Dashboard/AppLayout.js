import React, { useState } from "react";
import styled from "styled-components";
import
{
    Layout,
    Breadcrumb,
    Input,
    Divider,
    Button,
} from "antd";
import
{
    PlusOutlined
} from "@ant-design/icons";

import SideBar from "./SideBar";
import AppHeader from "./Header";
import { useAuth } from "../../contexts/AuthContext";


const { Content, Sider } = Layout;


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
margin-top:14px;
margin-right:44px;
background:#fff;

`;

const AddSide = styled( Button )`
background:transparent !important ;
border: none;
margin: 5px auto;
color: #262626;
box-shadow:none;
font-size: 16px;
line-height: 24px;
padding-left:0;

`;

const Partition = styled( Divider )`
  height:100px;
`;


const AppLayout = ( {
    rightNavItems = [],
    activeRightItem = "test",
    breadCrumbItems = [],
    setActiveRightNav,
    onChangeProduct,
    onMainAdd,
    hasMainAdd,
    defaultText,
    onSideAdd,
    hasSideAdd = true,
    hideSideBar = false,
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
            <AppHeader onChangeProduct={ onChangeProduct } />
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
                                        { defaultText || activeRightItem }
                                    </Breadcrumb.Item>
                                </Breadcrumb>

                                {
                                    hasMainAdd ? <AddNew onClick={ onMainAdd }>
                                        Add New
                                    </AddNew> : null
                                }


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
                        {
                            hideSideBar ? null : (
                                <div>
                                    <div>
                                        <Versions className="">
                                            {
                                                rightNavItems.map( ( item, i ) => (
                                                    <Version
                                                        className="capitalize"
                                                        key={ i }
                                                        active={ activeRightItem === ( item.value || item ) }
                                                        onClick={ () => setActiveRightNav( item.value ? item.value : item ) }
                                                    >
                                                        { item.render ? item.render() : item }
                                                    </Version>
                                                ) )
                                            }


                                            {
                                                ( hasSideAdd && showSideAdd ) ?
                                                    <Version> <Input
                                                        className="mx-0 my-0"
                                                        type="number"
                                                        maxLength={ 20 }
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
                                                            { showSideAdd ? "Close" : "Add" }
                                                        </AddSide>
                                                    </Version>
                                                    : null
                                            }

                                        </Versions>



                                    </div>
                                </div>
                            )
                        }

                    </div>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
