import React, { useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { Layout, Typography, Input, Avatar, Drawer, Space } from "antd";
import { MessageFilled, CloseOutlined } from "@ant-design/icons";

import products from "../../fakeData/products.json";

import { useAuth } from "../../contexts/AuthContext";
import SettingsMenu from "./SettingsMenu";

const { Header } = Layout;
const { Title } = Typography;
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

const AppHeader = ({ onChangeProduct }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const [settingsMenuDrawer, setSettingsMenuDrawer] = useState(false);

  const onProductChange = (product) => {
    setActiveProduct(product);
    onChangeProduct && onChangeProduct(product);
  };

  return (
    <Header
      className="header"
      style={{ position: "fixed", zIndex: 1, width: "100%" }}
    >
      <div className="flex items-center">
        <Title level={2} className="dashboard-logo m-0">
          Sprint Zero
        </Title>
        <div className="flex items-center ml-11">
          {products.map((item, i) => (
            <HeaderMenu
              key={i}
              className="mr-10"
              active={activeProduct === item}
              onClick={() => onProductChange(item)}
            >
              {item}
            </HeaderMenu>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <Search
          placeholder="Search"
          allowClear
          className="mr-6 border-none focus:outline-none outline-none"
          // onSearch={onSearch}
          style={{ width: 200 }}
        />
        {/* <MessageFilled
                    style={ { color: "#73c92d", width: "24px" } }
                    className="mr-6"
                /> */}
        <Avatar
          onClick={() => setSettingsMenuDrawer(true)}
          src={user?.photoURL}
          style={{ border: "2px solid #73c92d", cursor: "pointer" }}
        />
      </div>
      <Drawer
        id="settingsDrawer"
        title={<span className="text-16 font-semibold">Settings</span>}
        placement="right"
        visible={settingsMenuDrawer}
        width="161px"
        closable={false}
        extra={
          <Space>
            <CloseOutlined
              style={{ width: "10px", height: "10px" }}
              onClick={() => setSettingsMenuDrawer(false)}
            />
          </Space>
        }
      >
        <SettingsMenu />
      </Drawer>
    </Header>
  );
};

export default AppHeader;
