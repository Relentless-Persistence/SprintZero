/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col, Card } from "antd";

import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes, getTimeAgo } from "../../../utils";

import fakeData from "../../../fakeData/huddleData.json";
import products from "../../../fakeData/products.json";
import HuddleCard from "../../../components/Hubble/Huddle";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { findIndex } from "lodash";

const generateRightNav = (items) => {
  if (!items?.length) {
    return ["Now"];
  }

  return items.map((it) => ({
    render: () => getTimeAgo(it.createdAt),
    value: it.createdAt,
  }));
};

export default function Huddle() {
  const { pathname } = useRouter();
  const activeProduct = useRecoilValue(activeProductState);

  const [data, setData] = useState([]);
  const [activeTimeIndex, setActiveTimeIndex] = useState(0);
  const [activeTime, setActiveTime] = useState(
    data.length > 0 ? data[0].createdAt : "Now"
  );

  // Fetch data from firebase
  const fetchHuddles = async () => {
    if (activeProduct) {
      const res = db
        .collection("huddles")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))); 
          setActiveTime(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).length >
              0
              ? snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0]
                  .createdAt
              : "Now"
          );
          console.log(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        });
       
    }
  };

  useEffect(() => {
    fetchHuddles();
  }, [activeProduct])

  const setActiveRightNav = (date) => {
    const activeData = data;

    const huddleIndex = activeData.findIndex((v) => v.createdAt === date);

    if (huddleIndex > -1) {
      const huddle = activeData[huddleIndex];
      setActiveTime(huddle.createdAt);
      setActiveTimeIndex(huddleIndex);
    }
  };

  const handleCheck = (itemIndex, sectionKey, cardIndex) => {
    // const newData = { ...data };
    // const activeData = newData;
    // const comments = activeData[activeTimeIndex].comments;

    // comments[cardIndex].data[sectionKey][itemIndex].complete =
    //   !comments[cardIndex].data[sectionKey][itemIndex].complete;

    // setData(newData);
    alert("More discussions needed here")
  };

  const onClickAddNew = (sectionKey, cardIndex) => {
    // const newData = { ...data };
    // const activeData = newData[activeProduct];
    // const comments = activeData[activeTimeIndex].comments;

    // comments[cardIndex].data[sectionKey].push({
    //   text: "",
    //   complete: false,
    // });

    // setData(newData);
    alert("More discussions needed here");
  };

  const doneAddNew = (sectionKey, cardIndex, value, callback) => {
    // const newData = { ...data };
    // const activeData = newData[activeProduct];
    // let comments = activeData[activeTimeIndex].comments;

    // const val = value?.trim() || "";

    // if (val) {
    //   const length = comments[cardIndex].data[sectionKey].length - 1;
    //   comments[cardIndex].data[sectionKey][length].text = val;
    // } else {
    //   comments[cardIndex].data[sectionKey] = comments[cardIndex].data[
    //     sectionKey
    //   ].filter((x) => {
    //     return x?.text?.trim().length > 0;
    //   });
    // }

    // setData(newData);
    // callback();
    alert("More discussions needed here");
  };

  const rightNav = generateRightNav(data);

  return (
    <div>
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy huddle" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        hasSideAdd={false}
        defaultText={getTimeAgo(data.length > 0 ? data[0].createdAt : "Now")}
        rightNavItems={rightNav}
        setActiveRightNav={setActiveRightNav}
        activeRightItem={activeTime}
        mainClass="mr-[140px]"
        breadCrumbItems={splitRoutes(pathname)}
      >
        <Row className="max-w-[1200px] overflow-x-auto" gutter={[16, 16]}>
          {activeTime ? (
            <>
              {data?.map((c, index) => (
                <Col className="flex" key={index} span={8}>
                  <HuddleCard
                    comment={c}
                    handleCheck={handleCheck}
                    onClickAddNew={onClickAddNew}
                    doneAddNew={doneAddNew}
                    index={index}
                  />
                </Col>
              ))}
            </>
          ) : (
            <h2 className="text-[#595959] text-center">Nothing to see</h2>
          )}
        </Row>
      </AppLayout>
    </div>
  );
}
