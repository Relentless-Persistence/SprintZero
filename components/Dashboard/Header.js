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

const CustomHeader = styled(Header)`
  &.ant-layout-header {
    padding: 0 17.45px !important;
    height: auto;
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
    <CustomHeader
      className="header"
      style={{ position: "fixed", zIndex: 1000000, width: "100%" }}
    >
      <div className="flex items-center">
        <Image
          src="/images/logo.png"
          alt="Logo"
          className="w-[178px] h-[42px]"
          preview={false}
        />
        {/* <Title level={2} className="m-0 dashboard-logo">
          
        </Title> */}
        <div className="flex items-center ml-11">
          {products.slice(0, 1).map((item, i) => (
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
          className="mr-6 border-none outline-none focus:outline-none"
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
        title={<span className="font-semibold text-16">Settings</span>}
        placement="right"
        visible={settingsMenuDrawer}
        width="161px"
        style={{ zIndex: 1000000000 }}
        closable={false}
        extra={
          <Space>
            <div className="flex items-center h-full">
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
    </CustomHeader>
  );
};

export default AppHeader;
