import React, { useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import { Layout, Typography, Input, Avatar, Drawer, Space, Image } from "antd";
import { MessageFilled, CloseOutlined } from "@ant-design/icons";

import products from "../../fakeData/products.json";

import { useAuth } from "../../contexts/AuthContext";
import SettingsMenu from "./SettingsMenu";
import light from "../light.svg";

const { Header } = Layout;
const { Title } = Typography;
const { Search } = Input;

const HeaderMenu = styled.div`
  color: #fff;
  font-weight: ${(props) => (props.active ? 600 : 400)};
  cursor: pointer;
  border-bottom-width: 4px;
  border-bottom-style: solid;
  border-bottom-color: ${(props) => (props.active ? "#73c92d" : "transparent")};

  /* &:hover {
    color: var(--kelly);
    border-bottom: 4px solid var(--kelly);
  } */
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
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/sprintzero-657f3.appspot.com/o/logoDarkLettersWhite%201.png?alt=media&token=e97358f0-8ed9-4026-b9a7-42c224ff4d64"
          alt="Logo"
          className="w-[178px] h-[42px]"
          preview={false}
        />
        {/* <Title level={2} className="dashboard-logo m-0">
          
        </Title> */}
        <div className="flex items-center ml-11 mb-1">
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
        {/* <Search
          placeholder="Search"
          allowClear
          className="mr-6 border-none focus:outline-none outline-none"
          // onSearch={onSearch}
          style={{ width: 200 }}
        /> */}
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
            <div className="h-full flex items-center">
              <CloseOutlined
                style={{ width: "10px", height: "10px" }}
                onClick={() => setSettingsMenuDrawer(false)}
              />
            </div>
          </Space>
        }
      >
        <SettingsMenu />
      </Drawer>
    </Header>
  );
};

export default AppHeader;
