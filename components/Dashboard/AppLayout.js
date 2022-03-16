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
  border-left-width: 4px;
  border-left-style: solid;
  border-left-color: ${ ( props ) => ( props.active ? "#315613" : "#3156131a" ) };
  cursor: pointer;
  padding-bottom:28px;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;

`;

const AddNew = styled( Button )`
align-items:center;
display:flex;
margin-left:10px;
background:#fff;

`;

const AddSide = styled( Button )`
background:transparent !important ;
border: none;
color: #262626 !important ;
box-shadow:none;
font-size: 16px;
line-height: 24px;
margin:0;
padding:0;
text-align:center;

`;

const capitalize = text => `${ text[ 0 ]?.toUpperCase() }${ text?.substring( 1 ).toLowerCase() }`;


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
    ignoreLast,
    type,
    addNewText = "Add New",
    capitalizeText = true,
    versionClass,
    topExtra = <></>,
    useGrid,
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

    //if ( !user ) return <div>Loading...</div>;

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
                <Layout>
                    <div
                        style={ useGrid ?
                            {
                                display: "grid",
                                "grid-template-columns": "minmax(0,1fr) auto"
                            } : {} }
                        className={ useGrid ? null : "flex justify-between" }>
                        <div
                            className="flex-1 py-[24px] pl-[42px] pr-[33px]">
                            <div className="flex justify-between items-center">
                                <Breadcrumb>
                                    {
                                        breadCrumbItems.map( ( item, i ) => (
                                            <Breadcrumb.Item
                                                key={ i }
                                            >
                                                { capitalize( item ) }
                                            </Breadcrumb.Item>
                                        ) )
                                    }

                                    {
                                        ignoreLast ? null : <Breadcrumb.Item className="text-green-800 ">
                                            { capitalizeText ? capitalize( defaultText || activeRightItem ) : ( defaultText || activeRightItem ) }
                                        </Breadcrumb.Item>
                                    }

                                </Breadcrumb>

                                <div
                                    className="flex justify-between items-center">

                                    {
                                        <div >
                                            { topExtra }
                                        </div>
                                    }

                                    {
                                        hasMainAdd ? <AddNew onClick={ onMainAdd }>
                                            { addNewText }
                                        </AddNew> : null
                                    }
                                </div>




                            </div>

                            <Content
                                className="px-0 pt-[12px] pb-[16px] m-0 "
                            >
                                { children }
                            </Content>
                        </div>


                        {
                            hideSideBar ? null : (
                                <div style={ { minWidth: 0 } }>
                                    <div>
                                        <Versions className="">
                                            {
                                                rightNavItems.map( ( item, i ) => (
                                                    <Version
                                                        className={ `py-[16px] px-[24px] ${ versionClass }` }
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
                                                    <Version
                                                        className={ `py-[16px] px-[24px] ${ versionClass }` }>
                                                        <Input
                                                            className="mx-0 my-0 "
                                                            type={ type || "number" }
                                                            maxLength={ 20 }
                                                            autoFocus
                                                            value={ value }
                                                            onChange={ handleChange }
                                                            onKeyPress={ onEnter }
                                                            style={ { width: "100%" } }
                                                        />
                                                    </Version>
                                                    : null
                                            }

                                            {
                                                hasSideAdd ?

                                                    <Version className="flex items-center justify-center">
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
