import React, { useState } from "react";
import styled from "styled-components";
import { Layout, Menu, Breadcrumb, Typography, Input, Avatar } from "antd";
import { useRouter } from 'next/router';
import Link from 'next/link';
import
{
  HomeOutlined,
  MessageFilled,
  DeploymentUnitOutlined,
  PullRequestOutlined,
  NodeExpandOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;
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

const products = [ "Insight Meeting", "Alpha Sheet" ];

const DashboardLayout = () =>
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
              <HeaderMenu key={ i } className="mr-10" active={ product === item ? true : false } onClick={ () => setProduct( item ) }>{ item }</HeaderMenu>
            ) ) }

            {/* <div className="mr-10" style={{ color: "#73c92d"}}>Add Product</div> */ }
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
        // collapsible
        // collapsed={collapsed}
        // onCollapse={onCollapse}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={ [ "1" ] }
            // defaultOpenKeys={["sub2"]}
            style={ { height: "100%", borderRight: 0 } }
          >
            <Menu.Item key="1" icon={ <HomeOutlined /> } onClick={ () => router.push( "/dashboard" ) }>
              Home
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
              <Menu.Item key="3">Partnerships</Menu.Item>
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
        </Sider>
        <Layout style={ { padding: "0 24px 24px" } }>
          <div className="flex justify-between">
            <div className="flex-1">
              <Breadcrumb style={ { margin: "16px 0 0 44px" } }>
                <Breadcrumb.Item>Story Map</Breadcrumb.Item>
                <Breadcrumb.Item>{ version }</Breadcrumb.Item>
              </Breadcrumb>
              <Content
                style={ {
                  padding: "24px 44px",
                  margin: 0,
                  minHeight: 280,
                } }
              >
                Here is where the magic happens
              </Content>
            </div>
            <div>
              <div>
                <Versions className="">
                  <Version
                    active={ version === "v1.0" ? true : false }
                    onClick={ () => setVersion( "v1.0" ) }
                  >
                    v1.0 [Active]
                  </Version>
                  <Version
                    active={ version === "v1.1" ? true : false }
                    onClick={ () => setVersion( "v1.1" ) }
                  >
                    v1.1
                  </Version>
                  <Version
                    active={ version === "v1.11" ? true : false }
                    onClick={ () => setVersion( "v1.11" ) }
                  >
                    v1.11
                  </Version>
                  <Version
                    active={ version === "All" ? true : false }
                    onClick={ () => setVersion( "All" ) }
                  >
                    All
                  </Version>
                  {/* <Version style={{ color: "#009CD5" }}>Add Release</Version> */ }
                </Versions>
              </div>


            </div>
          </div>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
