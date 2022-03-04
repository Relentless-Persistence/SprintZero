import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row } from "antd";

import AppLayout from "../../../components/Dashboard/AppLayout";
import Agenda from "../../../components/Calendar/Agenda";

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/huddleData.json";
import products from "../../../fakeData/products.json";

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

  const [data, setData] = useState(fakeData);
  const [activeTimeIndex, setActiveTimeIndex] = useState(0);
  const [calendarType, setCalendarType] = useState(
    ["Agenda", "Week", "Month", "Year"]
  );

  const setProduct = (product) => {
    setActiveProduct(product);
    setActiveTimeIndex(0);
    setActiveTime(data[product][0]);
  };

  // const setActiveRightNav = () => {
  //   const activeData = calendarType;

  //   const huddleIndex = activeData.findIndex((h) => h);

  //   if (huddleIndex > -1) {
  //     const huddle = activeData[huddleIndex];
  //     setActiveTime(huddle);
  //     setActiveTimeIndex(huddleIndex);
  //   }
  // };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy huddle" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        onChangeProduct={setProduct}
        hasSideAdd={false}
        defaultText={"Agenda"}
        rightNavItems={calendarType}
        // setActiveRightNav={setActiveRightNav}
        activeRightItem={calendarType}
        breadCrumbItems={splitRoutes(pathname)}
      >
        <Row className="py-6" gutter={[12, 12]}>
          <Agenda />
        </Row>
      </AppLayout>
    </div>
  );
}
