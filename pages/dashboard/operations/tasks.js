/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styled from "styled-components";

import {
  Input,
  Drawer,
  Tag,
  Checkbox,
  Form,
  Avatar,
  Row,
  Col,
  Comment,
  Button,
  List,
  DatePicker,
  TimePicker,
  message,
} from "antd";
import { SendOutlined, FlagOutlined, UserOutlined } from "@ant-design/icons";

import AppLayout from "../../../components/Dashboard/AppLayout";
import DrawerSubTitle from "../../../components/Dashboard/DrawerSubTitle";
import { CardTitle } from "../../../components/Dashboard/CardTitle";

import { Board } from "../../../components/Tasks/Boards";
import { Index } from "../../../components/Boards/NumberIndex";

import { splitRoutes } from "../../../utils";

import CustomTag from "../../../components/Tasks/CustomTag";
import ActionButtons from "../../../components/Personas/ActionButtons";
import ResizeableDrawer from "../../../components/Dashboard/ResizeableDrawer";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { findIndex, set } from "lodash";
import EditTask from "../../../components/Tasks/EditTask";
import AddTask from "../../../components/Tasks/AddTask";
import { userRole } from "../../../contexts/AuthContext"

const boards = ["Board 0", "Board 1", "Board 2", "Board 3", "Board 4"];

const { TextArea } = Input;

const SubTasks = styled.div`
  .ant-checkbox-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }
  .ant-checkbox-checked .ant-checkbox-inner {
    background: #4a801d;
    border: 1px solid #4a801d;
    border-radius: 2px;
  }
`;

export default function Tasks() {
  const { pathname } = useRouter();
  const [createMode, setCreateMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [task, setTask] = useState(null);

  const [data, setData] = useState(null);

  const activeProduct = useRecoilValue(activeProductState);

  const [activeBoard, setActiveBoard] = useState(boards[0]);
  const [activeBoardIndex, setActiveBoardIndex] = useState(0);

  // Fetch data from firebase
  const fetchTasks = async () => {
    if (activeProduct) {
      const res = db
        .collection("tasks")
        .where("product_id", "==", activeProduct.id)
        .where("board", "==", activeBoard)
        .onSnapshot((snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const backlog = data
            .filter((item) => item.status === "Backlog")
            .sort((a, b) => a.order - b.order);
          const doing = data
            .filter((item) => item.status === "Doing")
            .sort((a, b) => a.order - b.order);
          const review = data
            .filter((item) => item.status === "Review")
            .sort((a, b) => a.order - b.order);
          const done = data
            .filter((item) => item.status === "Done")
            .sort((a, b) => a.order - b.order);

          setData([
            {
              columnId: "0",
              columnName: "Backlog",
              data: backlog,
            },
            {
              columnId: "1",
              columnName: "Doing",
              data: doing,
            },
            {
              columnId: "2",
              columnName: "Review",
              data: review,
            },
            {
              columnId: "3",
              columnName: "Done",
              data: done,
            },
          ]);

          // if(data.length < 1) {
          //   setCreateMode(true)
          // }

        });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeProduct, activeBoard]);

  const handleDrawerChange = (e, key) => {
    setDrawerData((s) => ({
      ...s,
      [key]: e.target.value,
    }));
  };

  const setBoard = (board) => {
    const boardIndex = findIndex(boards, (o) => o === board);

    if (boardIndex > -1) {
      setActiveBoard(boards[boardIndex]);
      setActiveBoardIndex(boardIndex);
    }
  };

  const handleDrop = async (card, targetColId) => {

    const selectedTask = data[card.colId].data[card.id];
    const targetTask = data[targetColId];

    await db
      .collection("tasks")
      .doc(selectedTask.id)
      .update({
        status: targetTask.columnName,
        order: targetTask.data.length <= 0 ? 0 : targetTask.data.length === 1 ? 1 : targetTask.data.length - 1
      })
      .then(() => {
        message.success("Task updated successfully");
      })
      .catch((error) => {
        console.log(error);
        message.error("An error occurred!");
      });
  };

  const handleSwap = (currentCard, targetCard) => {
    const info = { ...data };

    console.log("currentCard ", currentCard);
    console.log("targetCard ", targetCard);

    const selectedTask = data[currentCard.colId].data[currentCard.id];
    const selectedTaskOrder = data[currentCard.colId].data[currentCard.id].order;
    const targetTask = data[targetCard.colId].data[currentCard.id];
    const targetTaskOrder = data[targetCard.colId].data[currentCard.id].order;

    console.log({
      selectedTask,
      selectedTaskOrder,
      targetTask,
      targetTaskOrder
    })
  };

  const renderCol = (card, index) => {
    return (

        <div style={{ widthh: "100%" }} onClick={() => selectTask(card)}>
          <CustomTag shortTitle={card.title} due_date={card.date} />
        </div>
    
    );
  };

  const selectTask = (task) => {
    if(userRole && userRole !== "viewer") {
      setTask(task);
      setEditMode(true);
    }
  }

  return (
    <div>
      <Head>
        <title>Tasks | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy tasks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        useGrid
        rightNavItems={boards}
        activeRightItem={boards[activeBoardIndex]}
        setActiveRightNav={setBoard}
        hasMainAdd
        addNewText="Add Task"
        hasSideAdd={false}
        breadCrumbClass="mr-[112px]"
        sideBarClass="h-[700px]"
        contentClass="pb-0"
        onMainAdd={() => setCreateMode(true)}
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
              paddingBottom: "5px",
              paddingRight: "100px",
            }}
          >
            {data && (
              <Board
                colCount={data.length}
                onDrop={handleDrop}
                // onSwap={handleSwap}
                columns={data}
                renderColumn={renderCol}
                columnHeaderRenders={[null, null, null]}
              />
            )}
          </div>
        </div>

        {task && (
          <EditTask
            editMode={editMode}
            setEditMode={setEditMode}
            task={task}
            setTask={setTask}
          />
        )}

        {data && (
          <AddTask
            createMode={createMode}
            setCreateMode={setCreateMode}
            product={activeProduct}
            order={data[0].data.length}
            board={activeBoard}
          />
        )}
      </AppLayout>
    </div>
  );
}
