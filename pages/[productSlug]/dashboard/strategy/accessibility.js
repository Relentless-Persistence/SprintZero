/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col, message, Button, Empty } from "antd";
import { findIndex } from "lodash";

import AppLayout from "../../../../components/Dashboard/AppLayout";
import FormCard from "../../../../components/Dashboard/FormCard";
import ItemCard from "../../../../components/Dashboard/ItemCard";
import MainSub from "../../../../components/Dashboard/MainSub";
import { splitRoutes } from "../../../../utils";
import MasonryGrid from "../../../../components/Dashboard/MasonryGrid";

import fakeData from "../../../../fakeData/accessiblity.json";
import products from "../../../../fakeData/products.json";
import { db } from "../../../../config/firebase-config";
import { activeProductState } from "../../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import Link from "next/link";

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
      console.log(activeChallenge);
      db.collection("Accessibility")
        .where("product_id", "==", activeProduct.id)
        .where("type", "==", activeChallenge)
        .onSnapshot((snapshot) => {
          setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          console.log(
            "access",
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  const fetchChallenges = async () => {
    if (data) {
      db.collection("Challenges")
        .where("product_id", "==", activeProduct.id)
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

  // const setProduct = (product) => {
  //   setActiveProduct(product);
  //   const challengeName = data[product][0].name;
  //   setChallenge(challengeName, product);
  //   setShowAdd(false);
  // };

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
      product_id: activeProduct.id,
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
    await db
      .collection("Challenges")
      .doc(id)
      .update({
        name: item.title,
        description: item.description,
      })
      .then(() => {
        message.success("Challenge updated successfully");
      });
  };

  const deleteItem = async (id) => {
    db.collection("Challenges")
      .doc(id)
      .delete()
      .then(() => {
        message.success("Challenge successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
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
        <MainSub>
          {data && (
            <p>
              {data[0]?.title} To learn more visit{" "}
              <span className="text-[#2D73C8] font-semibold">
                <a
                  href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/"
                  target="_blank"
                  rel="noreferrer"
                >
                  WCAG 2.1 at a Glance
                </a>
              </span>
            </p>
          )}
        </MainSub>

        {challengesData && challengesData.length > 0 ? (
          <MasonryGrid>
            {challengesData.map((res) => (
              <ItemCard
                key={res.id}
                onEdit={(item) => editItem(res.id, item)}
                onDelete={() => deleteItem(res.id)}
                item={res}
              />
            ))}
            <div
              style={{
                visibility: showAdd ? "visible" : "hidden",
              }}
              ref={ref}
            >
              <FormCard
                onSubmit={addItemDone}
                onCancel={() => setShowAdd(false)}
              />
            </div>
          </MasonryGrid>
        ) : (
          <>
            <br />
            <br />
            {showAdd ? (
              <MasonryGrid>
                <FormCard
                  onSubmit={addItemDone}
                  onCancel={() => setShowAdd(false)}
                />
              </MasonryGrid>
            ) : (
              <div className="flex items-center justify-center">
                <div
                  style={{
                    boxShadow:
                      "0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)",
                  }}
                  className="w-[320px] h-[187px] bg-white flex items-center justify-center rounded"
                >
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              </div>
            )}
          </>
        )}
      </AppLayout>
    </div>
  );
}
