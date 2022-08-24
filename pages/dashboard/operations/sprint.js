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

import { Board } from "../../../components/Boards";

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
import { useRecoilValue } from "recoil";
import { findIndex, set } from "lodash";

const getBoardNames = (boards) => {
  const boardNames = boards.map((g) => g.boardName);

  return boardNames;
};

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

const versions = ["v1.0", "v1.1", "v1.2"];

export default function Sprint() {
  const { pathname } = useRouter();

  const [data, setData] = useState(null);
  const [visible, setVisible] = useState(false);
  const activeProduct = useRecoilValue(activeProductState);
  const [commentsIndex, setCommentsIndex] = useState(0);

  // const [activeProduct, setActiveProduct] = useState(products[0]);

  const [activeBoard, setActiveBoard] = useState(versions[0]);
  const [activeBoardIndex, setActiveBoardIndex] = useState(0);

  // Fetch data from firebase
  const fetchSprints = async () => {
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
            .map((item) => {
              item.features.map((feature) => {
                feature.stories.map((story) => {
                  stories.push(story);
                });
              });
            });
          setData([
            {
              columnId: "0",
              columnName: "Backlog",
              data: stories.filter((item) => item.status === "Backlog"),
            },
            {
              columnId: "1",
              columnName: "Designing",
              data: stories.filter((item) => item.status === "Designing"),
            },
            {
              columnId: "2",
              columnName: "Critique",
              data: stories.filter((item) => item.status === "Critique"),
            },
            {
              columnId: "3",
              columnName: "Ready for Dev",
              data: stories.filter((item) => item.status === "Ready for Dev"),
            },
            {
              columnId: "4",
              columnName: "Developing",
              data: stories.filter((item) => item.status === "Developing"),
            },
            {
              columnId: "5",
              columnName: "Quality Assurance",
              data: stories.filter((item) => item.status === "Quality Assurance"),
            },
            {
              columnId: "6",
              columnName: "Ready",
              data: stories.filter((item) => item.status === "Ready"),
            },
            {
              columnId: "7",
              columnName: "Shipped",
              data: stories.filter((item) => item.status === "Shipped"),
            },
          ]);
          console.log([
            {
              columnId: "0",
              columnName: "Backlog",
              data: stories.filter((item) => item.status === "Backlog"),
            },
            {
              columnId: "1",
              columnName: "Designing",
              data: stories.filter((item) => item.status === "Designing"),
            },
            {
              columnId: "2",
              columnName: "Critique",
              data: stories.filter((item) => item.status === "Critique"),
            },
            {
              columnId: "3",
              columnName: "Ready for Dev",
              data: stories.filter((item) => item.status === "Ready for Dev"),
            },
            {
              columnId: "4",
              columnName: "Developing",
              data: stories.filter((item) => item.status === "Developing"),
            },
            {
              columnId: "5",
              columnName: "Quality Assurance",
              data: stories.filter(
                (item) => item.status === "Quality Assurance"
              ),
            },
            {
              columnId: "6",
              columnName: "Ready",
              data: stories.filter((item) => item.status === "Ready"),
            },
            {
              columnId: "7",
              columnName: "Shipped",
              data: stories.filter((item) => item.status === "Shipped"),
            },
          ]);
        });
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [activeProduct]);

  const setBoard = (board) => {
    const boardIndex = findIndex(versions, (o) => o === board);

    if (boardIndex > -1) {
      setActiveBoard(versions[boardIndex]);
      setActiveBoardIndex(boardIndex);
    }
  };

  const handleDrop = (card, targetColId) => {
    const info = { ...data };
    const newData = info[activeProduct][activeBoardIndex];
    const cardIndex = newData?.columns[card.colId]?.data?.findIndex(
      (c) => c.id === card.id
    );

    if (cardIndex > -1) {
      const cardInfo = newData.columns[card.colId].data[cardIndex];
      const newColumn = newData?.columns?.findIndex(
        (col) => col.columnId === targetColId
      );

      if (
        !newData.columns[newColumn].data ||
        !newData.columns[newColumn].data.length
      ) {
        newData.columns[newColumn].data = [cardInfo];
      } else {
        newData.columns[newColumn].data = [
          ...newData.columns[newColumn].data,
          cardInfo,
        ];
      }

      newData.columns[card.colId].data = newData.columns[
        card.colId
      ].data.filter((_, i) => i !== cardIndex);
    }

    info[activeProduct][activeBoardIndex] = newData;

    setData(info);
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

  const renderCol = (card, index) => {
    return (
      <>
        <Index>{index + 1}</Index>

        <div onClick={() => setVisible(true)}>
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
        rightNavItems={versions}
        activeRightItem={activeBoard}
        setActiveRightNav={setBoard}
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
            <Board
              colCount={data.length}
              onDrop={handleDrop}
              // onSwap={handleSwap}
              columns={data}
              renderColumn={renderCol}
              columnHeaderRenders={[null, null, null]}
            />
          </div>
        </div>

        <ResizeableDrawer
          title={
            <DrawerTitle gutter={[16, 16]}>
              <Col span={12}>
                <h3>card_title</h3>
                <StyledTag color="#91D5FF"># points total</StyledTag>
                <StyledTag color="#A4DF74">$0.00 total</StyledTag>

                <button className="text-[#1890FF]">Edit</button>
              </Col>
              <Col className="flex items-center justify-end" span={12}>
                <CloseTime>
                  <p className="text-[12px] mr-[11px] leading-[16px] !text-[#101D06]">
                    Last modified 2 hrs ago
                  </p>
                  <CloseOutlined
                    style={{
                      color: "#101D06",
                      fontSize: "12px",
                    }}
                    onClick={() => setVisible(false)}
                  />
                </CloseTime>
              </Col>
            </DrawerTitle>
          }
          placement={"bottom"}
          closable={false}
          onClose={() => setVisible(false)}
          visible={visible}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Title>Epic</Title>

              <Story>
                As a user I need to be aware of any issues with the platform so
                that I can pre-emptively warn attendees and provide any new
                contact information to join the meeting
              </Story>

              <Title className="mt-[24px]">Keep</Title>

              <p>
                <AppCheckbox checked>Darrell Steward</AppCheckbox>
              </p>

              <p>
                <AppCheckbox>Jane Cooper</AppCheckbox>
              </p>

              <p>
                <AppCheckbox checked>Bessie Cooper</AppCheckbox>
              </p>

              <p>
                <AppCheckbox>Floyd Miles</AppCheckbox>
              </p>
            </Col>

            <Col
              className="max-h-[250px] overflow-y-scroll pr-[20px]"
              offset={1}
              span={11}
            >
              <div className="flex items-center justify-between">
                <Title>Comments</Title>

                <Radio.Group size="small">
                  <RadioButton
                    checked={commentsIndex === 0}
                    onChange={() => setCommentsIndex(0)}
                    value={0}
                  >
                    Design
                  </RadioButton>
                  <RadioButton
                    checked={commentsIndex === 1}
                    onChange={() => setCommentsIndex(1)}
                    value={1}
                  >
                    Code
                  </RadioButton>
                </Radio.Group>
              </div>

              <List
                className="comment-list"
                itemLayout="horizontal"
                dataSource={comments[commentsIndex]}
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
                        className="inline-flex items-center justify-between"
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
        </ResizeableDrawer>
      </AppLayout>
    </div>
  );
}
