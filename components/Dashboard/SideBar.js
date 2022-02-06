import React from "react";
import { Menu } from "antd";
import Link from 'next/link';

import
{
    HomeOutlined,
    DeploymentUnitOutlined,
    PullRequestOutlined,
    NodeExpandOutlined,
    UserOutlined,
} from "@ant-design/icons";

const { SubMenu } = Menu;


const SideBar = () =>
{
    return (
        <Menu
            mode="inline"
            style={ { height: "100%", borderRight: 0 } }
        >
            <Menu.Item key="1" icon={ <HomeOutlined /> }>
                <Link href="/dashboard">
                    <a>
                        Home
                    </a>
                </Link>
            </Menu.Item>
            <SubMenu
                key="sub1"
                icon={ <DeploymentUnitOutlined /> }
                title="Strategy"
            >
                <Menu.Item key="2">
                    <Link href="/dashboard/strategy/objectives">
                        <a>Objectives</a>
                    </Link>
                </Menu.Item>
                <Menu.Item key="3">
                    <Link href="/dashboard/strategy/partnerships">
                        <a>Partnerships</a>
                    </Link>
                </Menu.Item>
                <Menu.Item key="4">Vision</Menu.Item>
                <Menu.Item key="5">Accessibility</Menu.Item>
                <Menu.Item key="6">Ethics</Menu.Item>
            </SubMenu>
            <SubMenu key="sub2" icon={ <PullRequestOutlined /> } title="Tactics">
                <Menu.Item key="7">Priorities</Menu.Item>
                <Menu.Item key="8">Retrospective</Menu.Item>
                <Menu.Item key="9">Release</Menu.Item>
                <Menu.Item key="10">Tasks</Menu.Item>
            </SubMenu>
            <SubMenu
                key="sub3"
                icon={ <NodeExpandOutlined /> }
                title="Operations"
            >
                <Menu.Item key="11">Calendar</Menu.Item>
                <Menu.Item key="12">Huddle</Menu.Item>
                <Menu.Item key="13">Performance</Menu.Item>
                <Menu.Item key="14">Sprint</Menu.Item>
            </SubMenu>
            <SubMenu key="sub4" icon={ <UserOutlined /> } title="Userbase">
                <Menu.Item key="15">Learnings</Menu.Item>
                <Menu.Item key="16">Dialogue</Menu.Item>
                <Menu.Item key="17">Personas</Menu.Item>
                <Menu.Item key="18">Journeys</Menu.Item>
            </SubMenu>
        </Menu>
    );
};

export default SideBar;
