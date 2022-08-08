/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import AppLayout from "../../../components/Dashboard/AppLayout";
import StatementForm from "../../../components/Vision/StatementForm";

import {
  checkEmptyArray,
  checkEmptyObject,
  getTimeAgo,
  splitRoutes,
} from "../../../utils";
import products from "../../../fakeData/products.json";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";


import fakeData from "../../../fakeData/visionData.json";
import Deck from "../../../components/Vision/Deck";

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
  // const [activeProduct, setActiveProduct] = useState(products[0]);
  const activeProduct = useRecoilValue(activeProductState); // get active product from recoil state
  const [vision, setVision] = useState(
    visionData.length > 0 ? visionData[0].createdAt : "Now"
  );
  const [info, setInfo] = useState();
  const [inEditMode, setEditMode] = useState(false);
  const [visionIndex, setVisionIndex] = useState(null);

  const { pathname } = useRouter();

  // const onChangeProduct = (productName) => {
  //   setActiveProduct(productName);

  //   const vision = checkEmptyArray(visionData)
  //     ? "Now"
  //     : visionData[0].createdAt;
  //   setVision(vision);
  // };

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

  // Create Vision
  const addVision = () => {
    const data = {
      createdAt: new Date().toISOString(),
      differentitors,
      keyBenefits,
      need,
      product_id,
      target_customer
    };

    db.collection("Visions")
      .add(data)
      .then((docRef) => {
        message.success("New vision added successfully");
      })
      .catch((error) => {
        message.error("Error adding vision");
      });
  }

  // Update Vision
  const updateVision = async (id, data) => {
    await db
      .collection("Visions")
      .doc(id)
      .update({
        data
      })
      .then(() => {
        message.success("Vision updated successfully");
      });
  };

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
      >
        {activeProduct
          ? (
              <Deck
                product={activeProduct.product}
                // setInfo={handleSetInfo}
                list={visionData}
                activeIndex={visionIndex}
                inEditMode={inEditMode}
              />
            )
          : null}

        {inEditMode || !visionData.length ? (
          <StatementForm info={info} handleSubmit={handleSubmit} />
        ) : null}
      </AppLayout>
    </div>
  );
}
