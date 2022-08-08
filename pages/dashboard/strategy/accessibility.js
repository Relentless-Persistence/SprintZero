/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col, message } from "antd";
import { findIndex } from "lodash";

import AppLayout from "../../../components/Dashboard/AppLayout";
import FormCard from "../../../components/Dashboard/FormCard";
import ItemCard from "../../../components/Dashboard/ItemCard";
import MainSub from "../../../components/Dashboard/MainSub";
import { splitRoutes } from "../../../utils";
import MasonryGrid from "../../../components/Dashboard/MasonryGrid";

import fakeData from "../../../fakeData/accessiblity.json";
import products from "../../../fakeData/products.json";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";

const getChallengeNames = (challenges) => {
  const challengeNames = challenges.map((g) => g.name);

  return challengeNames;
};

const challenges = ["Perceivable", "Operable", "Understandable", "Robust"];

export default function Accessiblity() {
  const { pathname } = useRouter();
  const ref = useRef(null);

  const [data, setData] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const activeProduct = useRecoilValue(activeProductState);
  const [challengesData, setChallengesData] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(challenges[0]);

  const fetchAccessibility = async () => {
    if (activeProduct) {
      const res = await db
        .collection("Accessibilty")
        .where("product_id", "==", activeProduct.id)
        .where("type", "==", activeChallenge)
        .get();
      const data = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(data);
    }
  };

  const fetchChallenges = async () => {
    if (data) {
      db
        .collection("Challenges")
        .where("accessibility_type", "==", activeChallenge)
        .onSnapshot((snapshot) => {
          setChallengesData(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  useEffect(() => {
    fetchAccessibility();
  }, [activeProduct, activeChallenge]);

  useEffect(() => {
    fetchChallenges();
  }, [data]);

  const setChallenge = (challengeName) => {
    const activeChallengeIndex = findIndex(
      challenges,
      (o) => o === challengeName
    );
    setActiveChallenge(challenges[activeChallengeIndex]);
  };

  const setProduct = (product) => {
    setActiveProduct(product);
    const challengeName = data[product][0].name;
    setChallenge(challengeName, product);
    setShowAdd(false);
  };

  const addItem = () => {
    const top =
      ref?.current?.getBoundingClientRect()?.top ||
      document?.documentElement?.scrollHeight;
    setShowAdd(true);

    window?.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  const addItemDone = (item) => {
    const data = {
      accessibility_type: activeChallenge,
      ...item,
    };
    db.collection("Challenges")
      .add(data)
      .then((docRef) => {
        message.success("New item added successfully");
      })
      .catch((error) => {
        message.error("Error adding item");
      });

    setShowAdd(false);
  };

  const editItem = async (id, item) => {
    await db.collection("Challenges").doc(id).update({
      name: item.title,
      description: item.description,
    })
    .then(() => {
      message.success("Challenge updated successfully");
    })
  };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy accessiblity" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        rightNavItems={challenges}
        activeRightItem={activeChallenge}
        setActiveRightNav={setChallenge}
        hasMainAdd={true}
        onMainAdd={addItem}
        hasSideAdd={false}
        breadCrumbItems={splitRoutes(pathname)}
        mainClass="mr-[174px]"
      >
        <MainSub>{data ? data[0].title : null}</MainSub>

        <MasonryGrid>
          {challengesData && challengesData.length > 0 ? (
            challengesData.map((res) => (
              <ItemCard
                key={res.id}
                onEdit={(item) => editItem(res.id, item)}
                item={res}
              />
            ))
          ) : (
            <div className="text-xl font-semibold">No data</div>
          )}

          <div
            style={{
              visibility: showAdd ? "visible" : "hidden",
            }}
            ref={ref}
          >
            <FormCard onSubmit={addItemDone} />
          </div>
        </MasonryGrid>
      </AppLayout>
    </div>
  );
}
