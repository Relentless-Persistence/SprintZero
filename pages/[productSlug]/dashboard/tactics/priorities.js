import React, { useState, useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import {
  Input,
  Drawer,
  Tag,
  Form,
  Avatar,
  Row,
  Col,
  Comment,
  Button,
  List,
} from "antd";
import {
  SendOutlined,
  FlagOutlined,
  CloseOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";

import AppLayout from "../../../../components/Dashboard/AppLayout";

import { CardTitle } from "../../../../components/Dashboard/CardTitle";
import MainSub from "../../../../components/Dashboard/MainSub";
import { scaleToVal, splitRoutes } from "../../../../utils";

import fakeData from "../../../../fakeData/priorities.json";
import products from "../../../../fakeData/products.json";
import { db } from "../../../../config/firebase-config";
import { findIndex } from "lodash"

import {
  DraggableTab,
  DraggableContainer,
} from "../../../../components/Priorities";
import DrawerSubTitle from "../../../../components/Dashboard/DrawerSubTitle";
import { activeProductState } from "../../../../atoms/productAtom";
import { useRecoilValue, useRecoilState } from "recoil";

const { TextArea } = Input;

const names = ["Epics", "Features", "Stories"]

const getNames = () => {
  const names = ["Epics", "Features", "Stories"]

  return names;
};

const comments = [
  {
    actions: [
      <button
        className="mr-[10px] flex justify-between items-center"
        key="like"
      >
        <LikeOutlined /> 127{" "}
      </button>,
      <button
        className="mr-[10px] flex justify-between items-center"
        key="dislike"
      >
        <DislikeOutlined /> 0
      </button>,
      <span
        className="mr-[10px] flex justify-between items-center"
        key="comment-list-reply-to-0"
      >
        Reply to
      </span>,
    ],
    author: "Han Solo",
    avatar: "https://joeschmoe.io/api/v1/random",
    content: (
      <p>
        We supply a series of design principles, practical patterns and high
        quality design resources (Sketch and Axure), to help people create their
        product prototypes beautifully and efficiently.
      </p>
    ),
  },
  {
    actions: [
      <button
        className="mr-[10px] flex justify-between items-center"
        key="like"
      >
        <LikeOutlined /> 127{" "}
      </button>,
      <button
        className="mr-[10px] flex justify-between items-center"
        key="dislike"
      >
        <DislikeOutlined /> 0
      </button>,
      <span
        className="mr-[10px] flex justify-between items-center"
        key="comment-list-reply-to-0"
      >
        Reply to
      </span>,
    ],
    author: "Han Solo",
    avatar: "https://joeschmoe.io/api/v1/random",
    content: (
      <p>
        We supply a series of design principles, practical patterns and high
        quality design resources (Sketch and Axure), to help people create their
        product prototypes beautifully and efficiently.
      </p>
    ),
  },
];

export default function Priorities() {
  const { pathname } = useRouter();
  const container = useRef();
  const activeProduct = useRecoilValue(activeProductState);
  const [data, setData] = useState(fakeData);
  const [epics, setEpics] = useState();
  const [features, setFeatures] = useState();
  const [stories, setStories] = useState();
  const [visible, setVisible] = useState(false);

  const [activePriority, setActivePriority] = useState(names[0]);
  const [disableDrag, setDisableDrag] = useState(true);
  const [activeData, setActiveData] = useState();
  const [activePriorityIndex, setActivePriorityIndex] = useState(0);
  const [text, setText] = useState(
    "As a user I need to be aware of any issues with the platform so that I can pre-emptivly warn attendees and provide any new contact information to join the meeting"
  );

  // Fetch data from firebase
  const fetchEpics = async () => {
    let stories = [];
    let features = [];
    if (activeProduct) {
      db
        .collection("Epics")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setEpics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
          // setActiveData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
          console.log("Epics", snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
          snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .map((item, epicIndex) => {
              item.features.map((feature, featureIndex) => {
                features.push({ ...feature, epic: item, epicIndex, featureIndex })
                feature.stories.map((story, storyIndex) => {
                  stories.push({
                    ...story,
                    order: storyIndex,
                    storyIndex: storyIndex,
                    epicIndex,
                    featureIndex,
                    feature: feature,
                    epic: item,
                  });
                });
              });
            });
          setStories(stories)
          setFeatures(features)
          console.log("features", features)
          console.log("stories", stories)
        });
    }
  }

  useEffect(() => {
    fetchEpics();
  }, [activeProduct]);

  const changeText = (e) => setText(e.target.value);

  const setPriority = (name) => {
    const index = findIndex(names, (o) => o === name);

    if (index > -1) {
      setActivePriority(names[index]);
    }

    if (names[index] === "Epics") {
      setActiveData(epics)
    } else if (names[index] === "Features") {
      setActiveData(features)
    } else {
      setActiveData(stories)
    }
  };



  const toggleDisable = () => setDisableDrag((s) => !s);

  const toggleDrawer = (itemIndex) => {
    setVisible((s) => !s);
  };

  const onStop = (e, itemData, index) => {
    console.log("itemData", itemData)
    console.log("index", index)
    const node = itemData.node.getBoundingClientRect();
    const nodeWidth = node.width;
    const nodeHeight = node.height;

    const parent = container?.current.getBoundingClientRect();
    const parentWidth = parent.width;
    const parentHeight = parent.height;

    const maxPossibleX = parentWidth - nodeWidth;
    const maxPossibleY = parentHeight - nodeHeight;

    const valX = scaleToVal(itemData.x, maxPossibleX);
    const valY = scaleToVal(itemData.y, maxPossibleY);

    if (activePriority === "Epics") {
      epics[index].feasibility_level = valX;
      epics[index].priority_level = 100 - valY;

      db.collection("Epics").doc(epics[index].id).update(epics[index]).then(() => fetchEpics())
    } else if (activePriority === "Features") {
      features[index].epic.features[features[index].featureIndex].feasibility_level = valX;

      features[index].epic.features[features[index].featureIndex].priority_level = 100 - valY;

      db.collection("Epics").doc(features[index].epic.id).update(features[index].epic).then(() => fetchEpics())
    } else {
      stories[index].epic.features[stories[index].featureIndex].stories[stories[index].storyIndex].feasibility_level = valX;

      stories[index].epic.features[stories[index].featureIndex].stories[stories[index].storyIndex].priority_level = 100 - valY;

      db.collection("Epics").doc(stories[index].epic.id).update(stories[index].epic).then(() => fetchEpics())
    }

    
  };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy tasks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        rightNavItems={getNames()}
        // onChangeProduct={setProduct}
        hasSideAdd={false}
        activeRightItem={activePriority}
        setActiveRightNav={setPriority}
        breadCrumbItems={splitRoutes(pathname)}
        hasMainAdd
        addNewText={disableDrag ? "Edit" : "Done"}
        mainClass="mr-[120px]"
        onMainAdd={toggleDisable}
      >
        <MainSub>
          Assess the practicality of proposed items to objectively and
          rationally uncover strengths and weaknesses, opportunities and
          threats, the resources required to carry through, and ultimately the
          prospects for success
        </MainSub>

        {epics && features && stories && <DraggableContainer disable={disableDrag} ref={container}>
          {activePriority === "Epics" ? epics.map((d, i) => (
            <DraggableTab
              onStop={onStop}
              ref={container}
              label={d.name}
              disable={disableDrag}
              index={i}
              onClickItem={toggleDrawer}
              val={{
                x: d.feasibility_level,
                y: d.priority_level,
              }}
              key={d.id}
            />
          )) : null}

          {activePriority === "Features" ? features.map((d, i) => (
            <DraggableTab
              onStop={onStop}
              ref={container}
              label={d.name}
              disable={disableDrag}
              index={i}
              onClickItem={toggleDrawer}
              val={{
                x: d.feasibility_level,
                y: d.priority_level,
              }}
              key={d.id}
            />
          )) : null}

          {activePriority === "Stories" ? stories.map((d, i) => (
            <DraggableTab
              onStop={onStop}
              ref={container}
              label={d.name}
              disable={disableDrag}
              index={i}
              onClickItem={toggleDrawer}
              val={{
                x: d.feasibility_level,
                y: d.priority_level,
              }}
              key={d.id}
            />
          )) : null}
        </DraggableContainer>}

        {/* <Drawer
          visible={visible}
          closable={false}
          placement={"bottom"}
          height={400}
          title={
            <Row>
              <Col span={21}>
                <CardTitle className="inline-block mr-[10px]">
                  System Status
                </CardTitle>
                <Tag color="#91D5FF">3 points</Tag>
                <Tag color="#A4DF74">$0.00 Total</Tag>

                <button className="text-[14px] leading-[16px] text-[#1890FF]">
                  Edit
                </button>
              </Col>

              <Col span={3}>
                <p className="inline-block text-[12px] leading-[16px] text-[#A6AE9D] mr-[10px]">
                  Last modified 2 hrs ago
                </p>

                <button
                  className="text-right"
                  onClick={() => setVisible(false)}
                >
                  <CloseOutlined color="#8C8C8C" />
                </button>
              </Col>
            </Row>
          }
        >
          <Row className="mt-[15px]">
            <Col span={12}>
              <DrawerSubTitle>Features</DrawerSubTitle>

              <TextArea onChange={changeText} value={text} rows={4} />
            </Col>
            <Col
              className="max-h-[250px] overflow-y-scroll pr-[20px]"
              offset={1}
              span={11}
            >
              <DrawerSubTitle>Comments</DrawerSubTitle>

              <List
                className="comment-list"
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={(item) => (
                  <li>
                    <Comment
                      actions={item.actions}
                      author={item.author}
                      avatar={item.avatar}
                      content={item.content}
                    />
                  </li>
                )}
              />

              <Comment
                avatar={
                  <Avatar
                    src="https://joeschmoe.io/api/v1/random"
                    alt="Han Solo"
                  />
                }
                content={
                  <>
                    <Form.Item>
                      <TextArea rows={2} />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        className="inline-flex justify-between items-center mr-[8px]"
                        disabled
                      >
                        <SendOutlined />
                        Post
                      </Button>

                      <Button
                        className="inline-flex justify-between items-center"
                        danger
                      >
                        <FlagOutlined />
                        Flag
                      </Button>
                    </Form.Item>
                  </>
                }
              />
            </Col>
          </Row>
        </Drawer> */}
      </AppLayout>
    </div>
  );
}
