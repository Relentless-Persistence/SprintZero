/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styled from "styled-components";

import {
  List,
  Avatar,
  Form,
  Comment,
  Button,
  Input,
  Row,
  Tag,
  Col,
  Radio,
  message,
} from "antd";

import {
  LikeOutlined,
  DislikeOutlined,
  CopyOutlined,
  CloseOutlined,
  SendOutlined,
  FlagOutlined,
} from "@ant-design/icons";

import AppLayout from "../../../components/Dashboard/AppLayout";

import { Board } from "../../../components/Dashboard/Sprint/Board";

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/sprint.json";
import products from "../../../fakeData/products.json";
import { Title } from "../../../components/Dashboard/SectionTitle";
import CustomTag from "../../../components/Dashboard/Tag";
import AppCheckbox from "../../../components/AppCheckbox";
import ResizeableDrawer from "../../../components/Dashboard/ResizeableDrawer";
import RadioButton from "../../../components/AppRadioBtn";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue, useRecoilState } from "recoil";
import { findIndex, set } from "lodash";
import { versionState } from "../../../atoms/versionAtom";
import update from "immutability-helper";
import StoryDetails from "../../../components/Sprint/StoryDetails";

const { TextArea } = Input;

const StyledTag = styled(Tag)`
  background: ${(props) => props.background || "#F5F5F5"};
  border: ${(props) => (props.$border ? "1px solid #BFBFBF" : "")};
  color: ${(props) => props.$textColor || "#262626"} !important;
  font-weight: 600;
  font-size: 14px;
  line-height: 22px;
`;

const DrawerTitle = styled(Row)`
  h3 {
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    display: inline-block;
    margin-right: 10px;
    color: #262626;
  }
`;

const CloseTime = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  p {
    color: #a6ae9d;
  }
`;

const Story = styled.p`
  padding: 12px 19px;
  background: #fff;
  color: #262626;
  border: 1px solid #d9d9d9;
`;

const Index = styled.span`
  width: 32px;
  height: 32px;
  border: 1px solid #101d06;
  background: #fff;
  text-align: center;
  margin: auto;
  border-radius: 50%;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const comments = [
  [
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
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
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
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
    },
  ],
  [
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
      author: "Jane Doe",
      avatar: "https://joeschmoe.io/api/v1/random",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
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
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
    },
  ],
];

export default function Sprint() {
  const { pathname } = useRouter();

  const [data, setData] = useState(null);
  const [visible, setVisible] = useState(false);
  const [story, setStory] = useState(null);
  const activeProduct = useRecoilValue(activeProductState);
  const [commentsIndex, setCommentsIndex] = useState(0);
  const [versions, setVersions] = useState(null);
  const [version, setVersion] = useRecoilState(versionState);
  const [rightNav, setRightNav] = useState(["1.0"]);
  const [newVersion, setNewVersion] = useState("");

  // const [activeProduct, setActiveProduct] = useState(products[0]);

  // const [activeBoard, setActiveBoard] = useState(versions[0]);
  // const [activeBoardIndex, setActiveBoardIndex] = useState(0);

  const fetchVersions = async () => {
    if (activeProduct) {
      db.collection("versions")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setVersions(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          const versions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setVersion(versions[0]);
        });
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [activeProduct]);

   const getVersions = async () => {
     let newVersion = [];
     if (versions) {
       setRightNav(versions.map(({ version }) => version));
       console.table(
         "Navs",
         versions.map(({ version }) => version)
       );
     }
   };

   useEffect(() => {
     getVersions();
   }, [versions]);
  

  // Fetch data from firebase
  const fetchSprints = async () => {
    let stories = [];
    if (activeProduct && version) {
      const res = db
        .collection("Epics")
        .where("product_id", "==", activeProduct.id)
        .where("version", "==", version.id)
        .onSnapshot((snapshot) => {
          snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .map((item, epicIndex) => {
              item.features.map((feature, featureIndex) => {
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
                  console.log("stories",stories)
                });
              });
            });
          setData([
            {
              columnId: "0",
              columnName: "Product Backlog",
              data: stories.filter(
                (item) => item.sprint_status === "Product Backlog"
              ),
            },
            {
              columnId: "1",
              columnName: "Design Sprint Backlog",
              data: stories.filter(
                (item) => item.sprint_status === "Design Sprint Backlog"
              ),
            },
            {
              columnId: "2",
              columnName: "Critique",
              data: stories.filter((item) => item.sprint_status === "Critique"),
            },
            {
              columnId: "3",
              columnName: "Design Done / Dev Ready",
              data: stories.filter(
                (item) => item.sprint_status === "Design Done / Dev Ready"
              ),
            },
            {
              columnId: "4",
              columnName: "Dev Sprint Backlog",
              data: stories.filter(
                (item) => item.sprint_status === "Dev Sprint Backlog"
              ),
            },
            {
              columnId: "4",
              columnName: "Developing",
              data: stories.filter(
                (item) => item.sprint_status === "Developing"
              ),
            },
            {
              columnId: "4",
              columnName: "Design Review",
              data: stories.filter(
                (item) => item.sprint_status === "Design Review"
              ),
            },
            {
              columnId: "4",
              columnName: "Peer Code Review",
              data: stories.filter(
                (item) => item.sprint_status === "Peer Code Review"
              ),
            },
            {
              columnId: "5",
              columnName: "QA",
              data: stories.filter((item) => item.sprint_status === "QA"),
            },
            {
              columnId: "6",
              columnName: "Production Queue",
              data: stories.filter(
                (item) => item.sprint_status === "Production Queue"
              ),
            },
            {
              columnId: "7",
              columnName: "Shipped",
              data: stories.filter((item) => item.sprint_status === "Shipped"),
            },
          ]);
        });
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [activeProduct, version]);

  const handleActiveVersion = (version) => {
    const versionIndex = findIndex(versions, (v) => v.version === version);

    if (versionIndex > -1) {
      setVersion(versions[versionIndex]);
    }
  };

  const handleDrop = async (card, targetColId) => {
    console.log("card", card);
    console.log("targetColId", targetColId)

    const selectedStory = data[card.colId].data[card.id];
    const targetStory = data[targetColId]

    console.log("selectedStory", selectedStory)

    selectedStory.epic.features[selectedStory.featureIndex].stories[
      selectedStory.storyIndex
    ].sprint_status = targetStory.columnName


    console.log("selectedStory", selectedStory);

    // console.log("newData", newData)

    if (
      selectedStory.epic.features[selectedStory.featureIndex].stories[
        selectedStory.storyIndex
      ].sprint_status === targetStory.columnName
    ) {
      console.log("epic", selectedStory.epic);
      await db
        .collection("Epics")
        .doc(selectedStory.epic.id)
        .update(selectedStory.epic)
        .then(() => {
          fetchSprints();
          message.success("story updated successfully");
        });
    }
  };

  const handleSwap = (currentCard, targetCard) => {
    const info = { ...data };
    const newData = info[activeProduct][activeBoardIndex];
    const columns = newData?.columns;

    const currentCardColumn = columns.find(
      (c) => c.columnId === currentCard.colId
    );
    const targetCardColumn = columns.find(
      (c) => c.columnId === targetCard.colId
    );

    const currentCardIndex = currentCardColumn?.data?.findIndex(
      (c) => c.id === currentCard.id
    );
    const targetCardIndex = targetCardColumn?.data?.findIndex(
      (c) => c.id === targetCard.id
    );

    //swap cards
    if (currentCard.colId === targetCard.colId) {
      [
        currentCardColumn.data[currentCardIndex],
        targetCardColumn.data[targetCardIndex],
      ] = [
        targetCardColumn.data[targetCardIndex],
        currentCardColumn.data[currentCardIndex],
      ];
    } else {
      //fake drop
      handleDrop(currentCard, targetCard.colId);
    }

    setData(info);
  };

  const selectStory = (story) => {
    setStory(story);
    setVisible(true);
  }

  const renderCol = (card, index) => {
    console.table("card", card)
    return (
      <>
        <Index>{index + 1}</Index>

        <div onClick={() => selectStory(card)}>
          <CustomTag icon={<CopyOutlined />} text={card.name} />
        </div>
      </>
    );
  };

  return (
    <div>
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy sprint" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        useGrid
        rightNavItems={rightNav}
        activeRightItem={version && version.version}
        setActiveRightNav={handleActiveVersion}
        hasMainAdd={false}
        hasSideAdd={false}
        breadCrumbItems={splitRoutes(pathname)}
      >
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <div
            style={{
              width: "1200px",
              marginBottom: "20px",
            }}
          >
            {data && (
              <Board
                colCount={data.length}
                onDrop={handleDrop}
                onSwap={() => console.log(this)}
                columns={data}
                renderColumn={renderCol}
                columnHeaderRenders={[null, null, null]}
              />
            )}
          </div>
        </div>

        {story && (
          <StoryDetails
            story={story}
            setStory={setStory}
            visible={visible}
            setVisible={setVisible}
            fetchSprints={fetchSprints}
          />
        )}
      </AppLayout>
    </div>
  );
}
