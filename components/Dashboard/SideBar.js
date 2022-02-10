import React from "react";
import { Menu } from "antd";
import Link from 'next/link';
import { useRouter } from 'next/router';

import
{
    HomeOutlined,
    DeploymentUnitOutlined,
    PullRequestOutlined,
    NodeExpandOutlined,
    UserOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

const { SubMenu } = Menu;

const isActive = ( url, path ) => url.toLowerCase().includes( path.toLowerCase() );

const StyledSubMenu = styled( SubMenu )`
    span,
    .ant-menu-submenu-arrow
    {
        color:#000 !important;
    }
`;

const MenuItem = styled( Menu.Item )`
    background-color: ${ props => props.$highlight ? "#EBF8E0" : "tranparent" } !important;
    color: ${ props => props.$highlight ? "#315613" : "#000" } ;
    box-shadow: ${ props => props.$highlight ? "inset -3px 0px 0px #73C92D" : "none" }  ;

    .ant-menu-item-icon
    {
        color: ${ props => props.$highlight ? "#315613" : "#000" } ;
    }

    &:hover
    {
        a
        {
            color:#000 !important;
        }
       
    }

`;


const SideBar = () =>
{
    const { pathname } = useRouter();


    return (
        <Menu
            mode="inline"
            style={ { height: "100%", borderRight: 0 } }
        >
            <MenuItem
                $highlight={ pathname === "/dashboard" }
                key="1" icon={ <HomeOutlined color="" /> }>
                <Link href="/dashboard">
                    <a>
                        Home
                    </a>
                </Link>
            </MenuItem>
            <StyledSubMenu
                key="sub1"
                icon={ <DeploymentUnitOutlined /> }
                title="Strategy"
            >
                <MenuItem $highlight={ isActive( pathname, "/strategy/objectives" ) } key="2">
                    <Link href="/dashboard/strategy/objectives">
                        <a>Objectives</a>
                    </Link>
                </MenuItem>
                <MenuItem key="3" $highlight={ isActive( pathname, "/strategy/visions" ) } >
                    <Link href="/dashboard/strategy/visions">
                        <a>Visions</a>
                    </Link>
                </MenuItem>

                <Menu.Item key="5">Accessibility</Menu.Item>
                <Menu.Item key="6">Ethics</Menu.Item>
            </StyledSubMenu>
            <StyledSubMenu key="sub2" icon={ <PullRequestOutlined /> } title="Tactics">
                <Menu.Item key="7">Priorities</Menu.Item>
                <Menu.Item key="8">Retrospective</Menu.Item>
                <Menu.Item key="9">Release</Menu.Item>
                <Menu.Item key="10">Tasks</Menu.Item>
            </StyledSubMenu>
            <StyledSubMenu
                key="sub3"
                icon={ <NodeExpandOutlined /> }
                title="Operations"
            >
                <Menu.Item key="11">Calendar</Menu.Item>
                <Menu.Item key="12">Huddle</Menu.Item>
                <Menu.Item key="13">Performance</Menu.Item>
                <Menu.Item key="14">Sprint</Menu.Item>
            </StyledSubMenu>
            <StyledSubMenu key="sub4" icon={ <UserOutlined /> } title="Userbase">
                <Menu.Item key="15">Learnings</Menu.Item>
                <Menu.Item key="16">Dialogue</Menu.Item>
                <Menu.Item key="17">Personas</Menu.Item>
                <Menu.Item key="18">Journeys</Menu.Item>
            </StyledSubMenu>
        </Menu>
    );
};

export default SideBar;
