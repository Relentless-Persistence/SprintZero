import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styled from "styled-components";

import { Row, Col, Drawer } from "antd";

import { CloseOutlined } from "@ant-design/icons";

import AppLayout from "../../../components/Dashboard/AppLayout";

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/dialogue.json";
import products from "../../../fakeData/products.json";
import {
  DialogueCard,
  AddNote,
  EditNote,
} from "../../../components/Dashboard/Dialogue";
import CardHeaderButton from "../../../components/Dashboard/CardHeaderButton";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";

const getRightNav = (data) => {
  return data.map((d) => d.title);
};

const Title = styled.p`
  font-size: 16px;
  line-height: 24px;
  color: #8c8c8c;
  flex: none;
  margin: 4px 0px;
`;

const DEFAULT_HEIGHT = 378;

const types = ["Identified", "Contacted", "Scheduled", "Interviewed", "Analyzing", "Processed"];

export default function Dialogue() {
  const { pathname } = useRouter();

  const [data, setData] = useState(null);

  const activeProduct = useRecoilValue(activeProductState);

  const [visible, setVisible] = useState(false);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

  const [visibleEdit, setVisibleEdit] = useState(false);

  const [activeDialogue, setActiveDialogue] = useState(types[0]);
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);

  const [dialogue, setDialogue] = useState(null);
  const [showAddNew, setShowAddNew] = useState(false);

  // Fetch data from firebase
  const fetchDialogues = async () => {
    if (activeProduct) {
      const res = db
        .collection("Dialogues")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
    }
  };

  useEffect(() => {
    setHeight(0.7 * window.innerHeight);
  }, []);


  const setDia = (name) => {
    const index = data[activeProduct].findIndex((r) => r.title === name);

    if (index > -1) {
      setActiveDialogueIndex(index);

      setActiveDialogue(data[activeProduct][index]);
    }
  };

  const setDrawerDialogue = (item) => {
    setDialogue(item);
  };

  const openEdit = () => {
    setVisibleEdit(true);
    setVisible(false);
  };

  const editDialogue = (dialogue) => {
    const { id } = dialogue;

    const newData = { ...data };

    const index = newData[activeProduct][activeDialogueIndex].list.findIndex(
      (r) => r.id === id
    );

    if (index > -1) {
      newData[activeProduct][activeDialogueIndex].list[index] = dialogue;
      setData(newData);
    }
  };

  const addDialogueDone = (dialogue) => {
    dialogue = {
      ...dialogue,
      id: new Date().getTime(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const newData = { ...data };

    newData[activeProduct][activeDialogueIndex].list.push(dialogue);

    setData(newData);
    setShowAddNew(false);
  };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero personas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        breadCrumbItems={splitRoutes(pathname)}
        // activeRightItem={activeDialogue?.title}
        // setActiveRightNav={setDia}
        mainClass="mr-[130px]"
        // rightNavItems={getRightNav(data[activeProduct])}
        hasMainAdd
        onMainAdd={() => setShowAddNew(true)}
        hasSideAdd={false}
      >
        {/* <Row className="py-6" gutter={[16, 16]}>
          {activeDialogue?.list.map((card, i) => (
            <Col xs={{ span: 24 }} sm={{ span: 8 }} key={i}>
              <DialogueCard
                setItem={setDrawerDialogue}
                openDrawer={setVisible}
                {...card}
              />
            </Col>
          ))}
        </Row>

        <Drawer
          height={height}
          forceRender={true}
          destroyOnClose={true}
          placement={"bottom"}
          closable={false}
          headerStyle={{
            background: "#F5F5F5",
          }}
          visible={visible}
          onClose={() => setVisible(false)}
          title={
            <Row>
              <Col span={23}>
                <>
                  <span>{dialogue?.name}</span>
                  &nbsp;
                  <CardHeaderButton
                    className="!bg-transparent border-[#4A801D]"
                    onClick={openEdit}
                  >
                    Edit
                  </CardHeaderButton>
                </>
              </Col>
              <Col span={1}>
                <CloseOutlined
                  color="#A6AE9D"
                  onClick={() => setVisible(false)}
                />
              </Col>
            </Row>
          }
        >
          <Row className="py-6" gutter={[20, 20]}>
            <Col span={16}>
              <p>
                <strong>Notes</strong>
              </p>

              {dialogue?.notes.map((note, i) => (
                <div key={i}>
                  <Title>{note.title}</Title>
                  <p>{note.response}</p>

                  <br />
                </div>
              ))}
            </Col>
            <Col offset={3} span={4}>
              <Title className="text-right">Region</Title>
              <p className="text-right text-lg">{dialogue?.region}</p>

              <br />
              <br />
              <Title className="text-right">Education</Title>
              <p className="text-right text-lg">{dialogue?.education}</p>
            </Col>
          </Row>
        </Drawer>

        {dialogue?.id ? (
          <EditNote
            height={height}
            visible={visibleEdit}
            dialogue={dialogue}
            setDialogue={setDialogue}
            setVisible={setVisibleEdit}
            onSubmit={editDialogue}
          />
        ) : null}

        {showAddNew ? (
          <AddNote
            visible={showAddNew}
            setVisible={setShowAddNew}
            onSubmit={addDialogueDone}
          />
        ) : null} */}
      </AppLayout>
    </div>
  );
}
