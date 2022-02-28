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

                <Menu.Item $highlight={ isActive( pathname, "/strategy/accessibility" ) } key="2">
                    <Link href="/dashboard/strategy/accessibility">
                        <a>Accessibility</a>
                    </Link>

                </Menu.Item>
                <Menu.Item
                    $highlight={ isActive( pathname, "/strategy/ethics" ) }
                    key="3">
                    <Link href="/dashboard/strategy/ethics">
                        <a>Ethics</a>
                    </Link>
                </Menu.Item>
                <MenuItem $highlight={ isActive( pathname, "/strategy/objectives" ) } key="4">
                    <Link href="/dashboard/strategy/objectives">
                        <a>Objectives</a>
                    </Link>
                </MenuItem>
                <MenuItem key="5" $highlight={ isActive( pathname, "/strategy/visions" ) } >
                    <Link href="/dashboard/strategy/visions">
                        <a>Visions</a>
                    </Link>
                </MenuItem>

            </StyledSubMenu>
            <StyledSubMenu key="sub2" icon={ <PullRequestOutlined /> } title="Tactics">
                <Menu.Item key="6">Priorities</Menu.Item>
                <MenuItem key="7" $highlight={ isActive( pathname, "/tactics/retrospective" ) } >
                    <Link href="/dashboard/tactics/retrospective">
                        <a>Retrospective</a>
                    </Link>
                </MenuItem>
                <Menu.Item key="8">Release</Menu.Item>
                <MenuItem key="9" $highlight={ isActive( pathname, "/tactics/tasks" ) } >
                    <Link href="/dashboard/tactics/tasks">
                        <a>Tasks</a>
                    </Link>
                </MenuItem>
            </StyledSubMenu>
            <StyledSubMenu
                key="sub3"
                icon={ <NodeExpandOutlined /> }
                title="Operations"
            >
                <Menu.Item key="11">Calendar</Menu.Item>
                <MenuItem key="12" $highlight={ isActive( pathname, "/operations/huddle" ) } >
                    <Link href="/dashboard/operations/huddle">
                        <a>Huddle</a>
                    </Link>
                </MenuItem>
                <Menu.Item key="13">Performance</Menu.Item>
                <MenuItem key="14" $highlight={ isActive( pathname, "/operations/sprint" ) } >
                    <Link href="/dashboard/operations/sprint">
                        <a>Sprint</a>
                    </Link>
                </MenuItem>
            </StyledSubMenu>
            <StyledSubMenu key="sub4" icon={ <UserOutlined /> } title="Userbase">
                <MenuItem key="15" $highlight={ isActive( pathname, "/userbase/learnings" ) } >
                    <Link href="/dashboard/userbase/learnings">
                        <a>Learnings</a>
                    </Link>
                </MenuItem>
                <MenuItem key="16" $highlight={ isActive( pathname, "/userbase/dialogue" ) } >
                    <Link href="/dashboard/userbase/dialogue">
                        <a>Dialogue</a>
                    </Link>
                </MenuItem>
                <MenuItem key="17" $highlight={ isActive( pathname, "/userbase/personas" ) } >
                    <Link href="/dashboard/userbase/personas">
                        <a>Personas</a>
                    </Link>
                </MenuItem>
                <Menu.Item key="18">Journeys</Menu.Item>
            </StyledSubMenu>
        </Menu>
    );
};

export default SideBar;
