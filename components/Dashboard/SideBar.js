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
      <Menu mode="inline" style={{ height: "100%", borderRight: 0 }}>
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link href="/dashboard">
            <a>Home</a>
          </Link>
        </Menu.Item>
        <SubMenu key="sub1" icon={<DeploymentUnitOutlined />} title="Strategy">
          <Menu.Item key="2">Accessibility</Menu.Item>
          <Menu.Item key="3">Ethics</Menu.Item>
          <Menu.Item key="4">
            <Link href="/dashboard/strategy/objectives">
              <a>Objectives</a>
            </Link>
          </Menu.Item>
          <Menu.Item key="5">Vision</Menu.Item>
          {/* <Menu.Item key="6">Partnerships</Menu.Item> */}
        </SubMenu>
        <SubMenu key="sub2" icon={<PullRequestOutlined />} title="Tactics">
          <Menu.Item key="6">Priorities</Menu.Item>
          <Menu.Item key="7">Retrospective</Menu.Item>
          <Menu.Item key="8">Release</Menu.Item>
          <Menu.Item key="9">Tasks</Menu.Item>
        </SubMenu>
        <SubMenu key="sub3" icon={<NodeExpandOutlined />} title="Operations">
          <Menu.Item key="10">Calendar</Menu.Item>
          <Menu.Item key="11">Huddle</Menu.Item>
          <Menu.Item key="12">Performance</Menu.Item>
          <Menu.Item key="13">Sprint</Menu.Item>
        </SubMenu>
        <SubMenu key="sub4" icon={<UserOutlined />} title="Userbase">
          <Menu.Item key="14">Dialogue</Menu.Item>
          <Menu.Item key="15">Journeys</Menu.Item>
          <Menu.Item key="16">Learnings</Menu.Item>
          <Menu.Item key="17">Personas</Menu.Item>
        </SubMenu>
      </Menu>
    );
};

export default SideBar;
