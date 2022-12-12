/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import Head from "next/head";
import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes } from "../../../utils";
import { useRouter } from "next/router";
import Account from "../../../components/Settings/Account";
import { findIndex } from "lodash";
import Members from "../../../components/Settings/Members";
import { UserAddOutlined } from "@ant-design/icons";
import { Modal, Button } from "antd";

const members = () => {
  const router = useRouter();
  const { pathname } = useRouter();
  const menus = ["Account", "Billing", "Config", "Share", "Members"];
  const [activeMenuIndex, setActiveMenuIndex] = useState(4);
  const [addPerson, setAddPerson] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const setActiveRightNav = (h) => {
    const menuTypeIndex = findIndex(menus, (o) => o === h);
    router.push(`/dashboard/settings/${menus[menuTypeIndex].toLowerCase()}`);
  };

  return (
    <div>
      <Head>
        <title>Members Settings | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy accessiblity" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        ignoreLast={true}
        hasMainAdd={true}
        addNewText={
          <div
            className="flex items-center space-x-2"
            // onClick={() => setIsModalVisible(true)}
          >
            <UserAddOutlined />
            <p>Add</p>
          </div>
        }
        onMainAdd={() => setIsModalVisible(true)}
        hasSideAdd={false}
        breadCrumbItems={splitRoutes(pathname)}
        mainClass="mr-[174px]"
        rightNavItems={menus}
        activeRightItem={menus[activeMenuIndex]}
        setActiveRightNav={setActiveRightNav}
      >
        <Members />
      </AppLayout>
      <Modal
        // title="Basic Modal"
        visible={isModalVisible}
        // onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </div>
  );
};

export default members;
