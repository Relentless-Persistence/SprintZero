/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import AppLayout from "../../../../components/Dashboard/AppLayout";
import StatementForm from "../../../../components/Vision/StatementForm";

import {
  checkEmptyArray,
  checkEmptyObject,
  getTimeAgo,
  splitRoutes,
} from "../../../../utils";
import { db } from "../../../../config/firebase-config";
import { activeProductState } from "../../../../atoms/productAtom";
import { useRecoilValue } from "recoil";

import Deck from "../../../../components/Vision/Deck";

const generateRightNav = (items) => {
  if (!items?.length) {
    return ["Now"];
  }

  return items.map((it) => ({
    render: () => getTimeAgo(it.createdAt),
    value: it.createdAt,
  }));
};

export default function Visions() {
  const [visionData, setVisionData] = useState([]);
  const activeProduct = useRecoilValue(activeProductState); // get active product from recoil state
  const [vision, setVision] = useState(
    visionData.length > 0 ? visionData[0].createdAt : "Now"
  );
  const [info, setInfo] = useState();
  const [inEditMode, setEditMode] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [visionIndex, setVisionIndex] = useState(null);

  const { pathname } = useRouter();

  // Fetch vision data from firebase
  const fetchVisions = async () => {
    // console.log(activeProduct);
    if (activeProduct) {
      db.collection("Visions")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setVisionData(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          setVisionIndex(0)
          // console.log(
          //   snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          // );
        });
    }
  };

  useEffect(() => {
    fetchVisions();
  }, [activeProduct]);

  const handleActiveVision = (visionDate) => {
    const visions = visionData;

    const visionIndex = visions.findIndex((v) => v.createdAt === visionDate);

    if (visionIndex > -1) {
      const vision = visions[visionIndex];
      setVision(vision.createdAt);
      setVisionIndex(visionIndex);
      // setInfo({});
      setEditMode(false);
    }
  };

  const handleSubmit = (info) => {
    const data = {
      createdAt: new Date().toISOString(),
      info,
    };

    const newData = { ...visionData };
    newData[activeProduct] = [data, ...newData[activeProduct]];

    setVisionData(newData);
    setVision(newData[activeProduct][0].createdAt);
    setEditMode(false);
    setInfo({});
    setVisionIndex(0);
  };

  const handleSetInfo = (info) => {
    setEditMode(true);
    setInfo(info);
  };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy objectives" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        rightNavItems={generateRightNav(visionData)}
        activeRightItem={
          visionData.length > 0 ? visionData[0].createdAt : "Now"
        }
        setActiveRightNav={handleActiveVision}
        hasSideAdd={false}
        defaultText={getTimeAgo(
          visionData.length > 0 ? visionData[0].createdAt : "Now"
        )}
        // onChangeProduct={onChangeProduct}
        mainClass="mr-[160px]"
        breadCrumbItems={splitRoutes(pathname)}
        hasMainAdd={true}
        onMainAdd={() => setAddMode(true)}
      >
        {activeProduct ? (
          <Deck
            product={activeProduct.name}
            // setInfo={handleSetInfo}
            list={visionData}
            activeIndex={visionIndex}
            inEditMode={inEditMode}
            setEditMode={setEditMode}
          />
        ) : null}

        {addMode || !visionData.length ? (
          <StatementForm
            activeProduct={activeProduct}
            setAddMode={setAddMode}
          />
        ) : null}
      </AppLayout>
    </div>
  );
}
