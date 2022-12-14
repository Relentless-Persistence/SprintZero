/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styled from "styled-components";

import {
  List,
  Avatar,
  Menu,
  Input,
  Row,
  Tag,
  Col,
  Button,
  Drawer,
  Comment,
  Form,
  Alert,
  message,
} from "antd";
import {
  DislikeOutlined,
  LikeOutlined,
  LinkOutlined,
  CloseOutlined,
  FlagOutlined,
  SendOutlined,
} from "@ant-design/icons";

import AppLayout from "../../../../components/Dashboard/AppLayout";

import { Board } from "../../../../components/Dashboard/Sprint/Board";
// import { Index } from "../../../components/Boards/NumberIndex";

import { splitRoutes } from "../../../../utils";

import { Title } from "../../../../components/Dashboard/SectionTitle";
import CustomTag from "../../../../components/Sprint/CustomTag";
import AppCheckbox from "../../../../components/AppCheckbox";
import { db } from "../../../../config/firebase-config";
import { activeProductState } from "../../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import StoryDetails from "../../../../components/Ethics/StoryDetails";

const { TextArea } = Input;

const list = [
  {
    title: "Han Solo",
    text: "Authoritatively disseminate prospective leadership via opportunities economically sound.",
  },
  {
    title: "Kim James",
    text: "Is this really want we think the story should be? ",
  },
];

const getBoardNames = (boards) => {
  const boardNames = boards.map((g) => g.boardName);

  return boardNames;
};

const menu = (
  <Menu>
    <Menu.Item key="1">All</Menu.Item>
    <Menu.Item key="2">Allowed</Menu.Item>
    <Menu.Item key="3">Rejected</Menu.Item>
  </Menu>
);

const ListItemMeta = styled(List.Item.Meta)`
  .ant-list-item-meta-title {
    margin-bottom: 0;
  }
`;

const ListTitle = styled.p`
  color: #8c8c8c;
  font-size: 12px;
  line-height: 16px;
`;

const SubListTitle = styled.p`
  font-size: 14px;
  line-height: 22px;
  color: #262626;
`;

const StyledTag = styled(Tag)`
  background: #f5f5f5;
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
  background: #f5f5f5;
  color: #262626;
  border: 1px solid #d9d9d9;
`;

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

export default function Ethics() {
  const router = useRouter();
  const { pathname } = useRouter();

  const activeProduct = useRecoilValue(activeProductState);
  const [data, setData] = useState(null);
  const [visible, setVisible] = useState(false);
  const [story, setStory] = useState(null);
  const [ethics, setEthics] = useState();

  // const [activeBoard, setActiveBoard] = useState(data[activeProduct][0]);
  const [activeBoardIndex, setActiveBoardIndex] = useState(0);

  const fetchEthics = async () => {
    let stories = [];
    if (activeProduct) {
      const res = db
        .collection("Epics")
        .where("product_id", "==", activeProduct.id)
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
                });
              });
            });
          const ethics = stories.filter((story) => story.flagged === true);
          setEthics(ethics);
          setData([
            {
              columnId: "0",
              columnName: "Identified",
              data: ethics.filter(
                (item) => item.ethics_status === "Identified"
              ),
            },
            {
              columnId: "1",
              columnName: "Under Review",
              data: stories.filter(
                (item) => item.ethics_status === "Under Review"
              ),
            },
            {
              columnId: "2",
              columnName: "Adjuticated",
              data: stories.filter(
                (item) => item.ethics_status === "Adjuticated"
              ),
            },
          ])
        });
    }
  };

  useEffect(() => {
    fetchEthics();
  }, [activeProduct]);

  const handleDrop = async (card, targetColId) => {
    const selectedStory = data[card.colId].data[card.id];
    const targetStory = data[targetColId];

    if (targetStory.columnName === "Adjuticated") {
      message.info(
        "Ethics status can't be changed while voting is still active"
      );
    } else {
      selectedStory.epic.features[selectedStory.featureIndex].stories[
        selectedStory.storyIndex
      ].ethics_status = targetStory.columnName;

      if (
        selectedStory.epic.features[selectedStory.featureIndex].stories[
          selectedStory.storyIndex
        ].ethics_status === targetStory.columnName
      ) {
        await db
          .collection("Epics")
          .doc(selectedStory.epic.id)
          .update(selectedStory.epic)
          .then(() => {
            message.success("story updated successfully");
            fetchEthics();
          });
      }
    }
  };

  const handleSwap = (currentCard, targetCard) => {
    // const info = { ...data };
    // const newData = info[activeProduct][activeBoardIndex];
    // const columns = newData?.columns;

    // const currentCardColumn = columns.find(
    //   (c) => c.columnId === currentCard.colId
    // );

    // const targetCardColumn = columns.find(
    //   (c) => c.columnId === targetCard.colId
    // );

    // const currentCardIndex = currentCardColumn?.data?.findIndex(
    //   (c) => c.id === currentCard.id
    // );
    // const targetCardIndex = targetCardColumn?.data?.findIndex(
    //   (c) => c.id === targetCard.id
    // );

    // //swap cards
    // if (currentCard.colId === targetCard.colId) {
    //   [
    //     currentCardColumn.data[currentCardIndex],
    //     targetCardColumn.data[targetCardIndex],
    //   ] = [
    //     targetCardColumn.data[targetCardIndex],
    //     currentCardColumn.data[currentCardIndex],
    //   ];
    // } else {
    //   //fake drop
    //   handleDrop(currentCard, targetCard.colId);
    // }

    // setData(info);
  };

  const selectStory = (story) => {
    setStory(story);
    setVisible(true);
  };

  const renderCol = (card, index) => {
    return (
      <>
        <div onClick={() => selectStory(card)}>
          <CustomTag shortTitle={card.name} feature={card.feature.name} />
          {/* <StyledItem
                    $color={ card.color }>
                    <span>x</span>
                    <p>
                        { card.title }</p>
                </StyledItem> */}
        </div>
      </>
    );
  };

  return (
    <div>
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy ethics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        ignoreLast={true}
        // onChangeProduct={setProduct}
        // rightNavItems={getBoardNames(data[activeProduct])}
        // activeRightItem={activeBoard?.boardName}
        // setActiveRightNav={setBoard}
        hasMainAdd={false}
        hasSideAdd={false}
        hideSideBar
        breadCrumbItems={splitRoutes(pathname)}
      >
        {data && (
          <>
            <Board
              colCount={data.length}
              onDrop={handleDrop}
              // onSwap={handleSwap}
              columns={data}
              renderColumn={renderCol}
              maxWidthClass="max-w-[1200px]"
            />

            {ethics.length < 1 ? (
              <div className="w-[400px] fixed bottom-2 right-2 z-10">
                <Alert
                  message={
                    <p>
                      No elements present; Add items to your{" "}
                      <span
                        className="font-semibold cursor-pointer"
                        onClick={() => router.push("/dashboard")}
                      >
                        story map
                      </span>{" "}
                      to populate
                    </p>
                  }
                  type="success"
                />
              </div>
            ) : null}

            {story && (
              <StoryDetails
                story={story}
                setStory={setStory}
                visible={visible}
                setVisible={setVisible}
                activeProduct={activeProduct}
              />
            )}
          </>
        )}
      </AppLayout>
    </div>
  );
}
