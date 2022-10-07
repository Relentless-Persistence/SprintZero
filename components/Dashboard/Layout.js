import React, { useState } from "react";
import styled from "styled-components";
import {
  Layout,
  Menu,
  Breadcrumb,
  Typography,
  Input,
  Avatar,
  Button,
  Image,
} from "antd";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  HomeOutlined,
  MessageFilled,
  DeploymentUnitOutlined,
  PullRequestOutlined,
  NodeExpandOutlined,
  UserOutlined,
} from "@ant-design/icons";
import SideBar from "./SideBar";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;
const { Title, Text } = Typography;
const { Search } = Input;

const HeaderMenu = styled.div`
  color: ${(props) => (props.active ? "#73c92d" : "#fff")};
  cursor: pointer;
  border-bottom-width: 4px;
  border-bottom-style: solid;
  border-bottom-color: ${(props) => (props.active ? "#73c92d" : "transparent")};

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
  border-left-color: ${(props) => (props.active ? "#315613" : "#ccc")};
  cursor: pointer;
`;

const products = ["Insight Meeting", "Alpha Sheet"];

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [version, setVersion] = useState("All");
  const [product, setProduct] = useState(products[0]);

  const onCollapse = (collapsed) => {
    setCollapsed(collapsed);
  };

  // if ( !user ) return <div>Loading...</div>;

  return (
    <Layout>
      <Header
        style={{
          position: "fixed",
          zIndex: 1,
          width: "100%",
        }}
      >
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={new Array(3).fill(null).map((_, index) => ({
            key: String(index + 1),
            label: `nav ${index + 1}`,
          }))}
        />
      </Header>
      <Layout>
        <div className="flex">
          <Sider className="h-[100%]">
            <div className="h-[64px]"></div>
            <SideBar />
          </Sider>
          <Content
            className="w-full"
            style={{
              padding: "0 50px",
              marginTop: 64,
            }}
          >
            <Breadcrumb
              style={{
                margin: "16px 0",
              }}
            >
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb>
            <div
              className="site-layout-background"
              style={{
                padding: 24,
                minHeight: 380,
              }}
            >
              Content
            </div>
          </Content>
          <Footer
            style={{
              textAlign: "center",
            }}
          >
            Ant Design ©2018 Created by Ant UED
          </Footer>
        </div>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
