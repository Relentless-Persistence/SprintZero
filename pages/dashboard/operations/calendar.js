import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button, Drawer, Row, Space } from "antd";
import { findIndex } from "lodash";

import AppLayout from "../../../components/Dashboard/AppLayout";
import Agenda from "../../../components/Calendar/Agenda";

import { splitRoutes } from "../../../utils";

import products from "../../../fakeData/products.json";
import CreateEvent from "../../../components/Calendar/CreateEvent";
import Month from "../../../components/Calendar/Month";
import Year from "../../../components/Calendar/Year";

const generateRightNav = (items) => {
  if (!items?.length) {
    return ["Now"];
  }

  return items.map((it) => ({
    value: it,
  }));
};

export default function Calendar() {
  const { pathname } = useRouter();
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [activeCalendarTypeIndex, setActiveCalendarTypeIndex] = useState(0);
  const [calendarType, setCalendarType] = useState(["Month", "Year"]);

  const setProduct = (product) => {
    setActiveProduct(product);
    setActiveCalendarTypeIndex(0);
  };

  const setActiveRightNav = (h) => {
    const calendarTypeIndex = findIndex(calendarType, (o) => o === h);

    if (calendarTypeIndex > -1) {
      const activeCalendarType = calendarType[calendarTypeIndex];
      setActiveCalendarTypeIndex(calendarTypeIndex);
    }
  };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy huddle" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        mainClass="mr-[110px]"
        onChangeProduct={setProduct}
        hasSideAdd={false}
        defaultText={calendarType[activeCalendarTypeIndex]}
        rightNavItems={calendarType}
        setActiveRightNav={setActiveRightNav}
        activeRightItem={calendarType[activeCalendarTypeIndex]}
        breadCrumbItems={splitRoutes(pathname)}
        topExtra={
          <Button
            className="bg-white text-gray-900"
            onClick={() => setOpenDrawer(true)}
          >
            Add Event
          </Button>
        }
      >
        <Row gutter={[12, 12]}>
          {
            // calendarType[activeCalendarTypeIndex] === "Agenda" ? (
            //   <Agenda />
            // ) :
            calendarType[activeCalendarTypeIndex] === "Month" ? (
              <Month />
            ) : calendarType[activeCalendarTypeIndex] === "Year" ? (
              <Year />
            ) : (
              "Week"
            )
          }
        </Row>
        <Drawer
          title={<h3 className="text-20 font-semibold">Event</h3>}
          closable={false}
          placement="bottom"
          width={"30%"}
          onClose={() => setOpenDrawer(false)}
          visible={openDrawer}
          extra={
            <Space>
              <Button danger onClick={() => setOpenDrawer(false)}>
                Cancel
              </Button>
              <Button type="primary" danger>
                Done
              </Button>
            </Space>
          }
        >
          <CreateEvent />
        </Drawer>
      </AppLayout>
    </div>
  );
}
