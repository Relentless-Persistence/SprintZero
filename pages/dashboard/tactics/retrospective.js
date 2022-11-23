/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styled from "styled-components";
import { Dropdown, Card, Avatar, Divider, messag, Empty } from "antd";

import { SortAscendingOutlined } from "@ant-design/icons";

import CardHeaderButton, {
  CardHeaderLink,
} from "../../../components/Dashboard/CardHeaderButton";

import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes } from "../../../utils";

import MasonryGrid from "../../../components/Dashboard/MasonryGrid";

import fakeData from "../../../fakeData/retrospective.json";
import products from "../../../fakeData/products.json";
import { ActionFormCard } from "../../../components/Dashboard/FormCard";
import AddItem from "../../../components/Retrospective/AddItem";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { useAuth } from "../../../contexts/AuthContext";
import { findIndex } from "lodash";

const { Meta } = Card;
const types = ["Enjoyable", "Puzzling", "Frustrating"];

const MyCard = styled(Card)`
  position: relative;
  border: 1px solid #d9d9d9;

  .ant-card-body {
    padding: 0;
  }

  .ant-card-meta {
    padding: 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #d9d9d9;
    border-top: 1px solid #d9d9d9;

    .ant-card-meta-title {
      margin-bottom: 0;
    }
  }

  article {
    padding: 16px 16px 0;

    h5 {
      font-weight: bold;
    }

    p {
      font-style: italic;
    }
  }
`;

export default function Retrospective() {
  const { user, userRole } = useAuth();
  const { pathname } = useRouter();

  const activeProduct = useRecoilValue(activeProductState);
  const [data, setData] = useState(null);

  // const [activeProduct, setActiveProduct] = useState(products[0]);
  const [activeEditIndex, setActiveEditIndex] = useState(null);

  const [showAdd, setShowAdd] = useState(false);

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleRightNav = (name) => {
    const index = findIndex(types, (o) => o === name);

    if (index > -1) {
      setActiveTabIndex(index);
    }
  };

  // Fetch data from firebase
  const fetchRetrospects = async () => {
    if (activeProduct) {
      const res = db
        .collection("Retrospectives")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
    }
  };

  useEffect(() => {
    fetchRetrospects();
  }, [activeProduct]);

  const onEdit = async (item) => {
    console.log(item);

    const data = {
      title: item.title,
      description: item.description,
    };
    await db
      .collection("Retrospectives")
      .doc(item.id)
      .update(data)
      .then(() => {
        message.success("Retrospective updated successfully");
        setActiveEditIndex(null);
      })
      .catch((error) => {
        console.log(error);
        message.error("An error occurred");
      });
  };

  const addRetro = () => {
    const newData = { ...data };

    const comments = newData[activeProduct][activeTabIndex].comments;

    const newComm = {
      avatar: "https://joeschmoe.io/api/v1/random",
      role: "Designer",
      name: user,
      title: dto.title,
      text: dto.description,
    };

    newData[activeProduct][activeTabIndex].comments = [newComm, ...comments];

    setData(newData);

    setShowAdd(false);
  };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero retrospective" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        rightNavItems={types}
        activeRightItem={types[activeTabIndex]}
        setActiveRightNav={handleRightNav}
        mainClass="mr-[128px]"
        addNewClass="px-[16px] min-w-[92px]"
        hasSideAdd={false}
        hasMainAdd
        onMainAdd={() => setShowAdd(true)}
        breadCrumbItems={splitRoutes(pathname)}
      >
        {data?.length > 0 ? (
          <MasonryGrid>
            {data
              .filter((item) => item.type === types[activeTabIndex])
              .map((c, i) =>
                i === activeEditIndex ? (
                  <>
                    <ActionFormCard
                      title={c.title}
                      description={c.description}
                      id={c.id}
                      className="mb-[16px]"
                      onCancel={() => setActiveEditIndex(null)}
                      onSubmit={onEdit}
                    />
                  </>
                ) : (
                  <MyCard
                    className="mb-[16px]"
                    // extra={ user === c.name ? <CardHeaderLink>Edit</CardHeaderLink> : null }
                    key={i}
                  >
                    <Meta
                      avatar={
                        <Avatar
                          size={48}
                          src={c.user?.photo}
                          style={{
                            border: "2px solid #315613",
                          }}
                        />
                      }
                      title={c.user?.name}
                      // description={c.role}
                    />

                    {userRole && userRole !== "viewer" && user.uid === c.user?.id ? (
                      <CardHeaderLink
                        onClick={() => setActiveEditIndex(i)}
                        className="absolute top-[28px] right-[16px]"
                      >
                        Edit
                      </CardHeaderLink>
                    ) : null}

                    <article>
                      <h5>{c.title}</h5>
                      <p>{c.description}</p>
                    </article>

                    <br />
                  </MyCard>
                )
              )}
          </MasonryGrid>
        ) : (
          <div className="h-[600px] flex items-center justify-center">
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

        <AddItem
          show={showAdd}
          onSubmit={addRetro}
          setShow={setShowAdd}
          user={user}
          product={activeProduct}
          type={types[activeTabIndex]}
        />
      </AppLayout>
    </div>
  );
}
