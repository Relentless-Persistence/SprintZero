/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button, Divider, message, Alert } from "antd";

import AppLayout from "../../../components/Dashboard/AppLayout";

import Task from "../../../components/Release/Task";

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/release.json";
import products from "../../../fakeData/products.json";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue, useRecoilState } from "recoil";
import ActionButtons from "../../../components/Personas/ActionButtons";
import { cloneDeep } from "lodash";

const logOldData = (data, activeProduct, activeDataIndex) => {
  const activeData = data[activeProduct][activeDataIndex];

  console.log(activeData?.taskList[0].subTasks[0]);
};

const getName = (list) => list?.map((l) => l.name);

export default function Release() {
  const { pathname } = useRouter();
  const chartRef = useRef(null);

  const [data, setData] = useState(fakeData);
  const [epics, setEpics] = useState(null);
  const [sprints, setSprints] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const dataRef = useRef(null);
  const activeProduct = useRecoilValue(activeProductState);
  const [activeDataIndex, setActiveDataIndex] = useState(0);

  //   const [activeVersion, setActiveVersion] = useState(
  //     data[activeProduct][activeDataIndex]?.name
  //   );

  const [activeData, setActiveData] = useState(null);

  const fetchEpics = () => {
    if (activeProduct) {
      db.collection("Epics")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setEpics(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          console.log(
            "Epics",
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          const epics = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setActiveData(epics[0]);
        });
    }
  };

  useEffect(() => {
    fetchEpics();
  }, [activeProduct]);

  const getSprints = async () => {
    if (activeProduct) {
      db.collection("Sprints")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setSprints(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          console.log(
            "Sprints",
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  useEffect(() => {
    getSprints();
  }, [activeProduct]);

  const sprintCount = sprints?.length || 1;
  const percentage = 100 / sprintCount;

  const enableDrag = () => {
    setDisabled(false);
  };

  const setVersion = (name) => {
    const activeVersionIndex = data[activeProduct].findIndex(
      (card) => card.name === name
    );

    if (activeVersionIndex > -1) {
      setActiveVersion(data[activeProduct][activeVersionIndex].name);
      setActiveDataIndex(activeVersionIndex);
    }
  };

  const getDuration = (target, begin) => {
    // const end = new Date(activeData?.target).getTime();
    // const start = new Date(activeData?.start).getTime();

    const end = new Date(target).getTime();
    const start = new Date(begin).getTime();

    const duration = end - start;

    return duration;
  };

  const getOffset = (subStart, target, begin) => {
    const subtaskStart = new Date(subStart).getTime();
    const start = new Date(activeData?.start).getTime();

    const dayOffset = subtaskStart - start;
    const duration = getDuration(target, begin);

    return (dayOffset / duration) * 100;
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.scrollTo(100, 0);
    }
  }, []);

  const onStop = (subTaskIndex, taskIndex, newDateInMs, epic, epicId) => {
    const newData = { ...epic };
    // dataRef.current = cloneDeep(data);

    // const activeData = newData[activeProduct][activeDataIndex];

    // const list = activeData.taskList[taskIndex].subTasks;

    // list[subTaskIndex] = {
    //   ...list[subTaskIndex],
    //   endDate: new Date(newDateInMs).toISOString(),
    // };
    newData.features[subTaskIndex].endDate = new Date(
      newDateInMs
    ).toISOString();

    db.collection("Epics").doc(epicId).update(newData)
    .then(() => {
      message.success("Update successfully");
    })

    console.log(newData);
    // setActiveData(activeData);
    // setData(newData);
  };

  const onCancel = () => {
    // const activeData = dataRef.current[activeProduct][activeDataIndex];
    // setActiveData(activeData);
    // setData(dataRef.current);

    setDisabled(true);
  };

  //   const taskList = activeData?.taskList || [];
    const duration = getDuration();

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy tasks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        breadCrumbItems={splitRoutes(pathname)}
        // rightNavItems={getName(data[activeProduct])}
        useGrid
        hasSideAdd={false}
        hideSideBar
        // setActiveRightNav={setVersion}
        // activeRightItem={activeVersion}
        ignoreLast={true}
        topExtra={
          disabled ? (
            <Button
              onClick={enableDrag}
              size="small"
              className="px-2 font[600] bg-white border-[#4A801D] text-[14px] leading-[22px] text-[#4A801D]"
            >
              Edit
            </Button>
          ) : (
            <ActionButtons
              className="ml-[12px]"
              onCancel={onCancel}
              onSubmit={() => setDisabled(true)}
            />
          )
        }
      >
        <div className="relative">
          {epics?.length > 0 ? (
            <>
              <div
                style={{
                  height: "500px",
                  position: "relative",
                  paddingTop: "20px",
                  overflowX: "scroll",
                  overflowY: "hidden",
                }}
              >
                <div
                  ref={chartRef}
                  style={{
                    width: `${sprintCount * 339}px`,
                    margin: "20px",
                    minHeight: "100%",
                    position: "relative",
                    background: !disabled ? "#fff" : "transparent",
                  }}
                >
                  {/* Vertical didviders */}

                  {/* Sprint titles */}
                  {sprints?.map((s, i) => (
                    <p
                      style={{
                        left: `${(i + 1) * percentage - percentage / 2}%`,
                        transform: "translateY(-30px)",
                      }}
                      className="absolute text-[#A6AE9D]"
                      key={s.id}
                    >
                      {s.name}
                    </p>
                  ))}
                  <div>
                    {epics?.map((t, i) => (
                      <Task
                        taskIndex={i}
                        ref={chartRef}
                        style={{
                          top: i == 0 ? `65px` : `${65 + i * (35 + 150)}px`,
                          left: `${getOffset(
                            t.startDate,
                            t.endDate,
                            t.startDate
                          )}%`,
                        }}
                        key={t.id}
                        subTasks={t.features}
                        name={t.name}
                        start={t.startDate}
                        end={t.endDate}
                        duration={getDuration(t.endDate, t.startDate)}
                        onStop={onStop}
                        disabled={disabled}
                        epicId={t.id}
                        epic={t}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
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
          )}
        </div>
      </AppLayout>
    </div>
  );
}
