/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import {
  Row,
  Col,
  Input,
  Select,
  Divider,
  DatePicker,
  Drawer,
  Button,
  Space,
  InputNumber,
  Form,
  message
} from "antd";
import { useRouter } from "next/router";
import { SettingOutlined } from "@ant-design/icons";
import AppLayout from "../../../components/Dashboard/Journeys/AppLayout";

import { Chart } from "../../../components/Dashboard/Journeys";

import fakeData from "../../../fakeData/journeys.json";
import products from "../../../fakeData/products.json";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { findIndex } from "lodash";
import { splitRoutes } from "../../../utils";
import AddEvent from "../../../components/Dashboard/Journeys/AddEvent";

const { Option } = Select;

const init = {
  id: "",
  journeyName: "",
  durationType: "",
  duration: 0,
  start: "",
  events: [],
};

const capitalize = (text) =>
  `${text[0]?.toUpperCase()}${text?.substring(1).toLowerCase()}`;

export default function Journeys() {
  const { pathname } = useRouter();
  const activeProduct = useRecoilValue(activeProductState);
  // const [activeProduct, setActiveProduct] = useState(products[0]);
  const [data, setData] = useState(fakeData);
  const [journeys, setJourneys] = useState(null);
  const [events, setEvents] = useState(null);
  const [rightNav, setRightNav] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [addJourney, setAddJourney] = useState(false);
  const [personas, setPersonas] = useState(null);

  // New Journey States
  const [newJourney, setNewJourney] = useState("");
  const [duration, setDuration] = useState("");
  const [durationType, setDurationType] = useState("days");

  // const initJourney = data[activeProduct][0]?.id
  //   ? data[activeProduct][0]
  //   : { ...init, events: [] };

  const [activeJourney, setActiveJourney] = useState(null);

  const fetchJourneys = async () => {
    if (activeProduct) {
      db.collection("Journeys")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setJourneys(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          const journeys = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          if (!snapshot.empty) {
            setActiveJourney(journeys[0]);
            setAddJourney(false);
          } else {
            setAddJourney(true);
          }
        });
    }
  };

  useEffect(() => {
    fetchJourneys();
  }, [activeProduct]);

  const fetchEvents = async () => {
    if (activeJourney) {
      db.collection("journeyEvents")
        .where("journey_id", "==", activeJourney.id)
        .onSnapshot((snapshot) => {
          setEvents(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeJourney]);

  const getNames = () => {
    // return data.map((d) => d.role);
    if (journeys) {
      setRightNav(journeys.map(({ name }) => name));
    }
  };

  useEffect(() => {
    getNames();
  }, [journeys]);

  const fetchPersonas = async () => {
    let participants = []
    if (activeProduct) {
      const res = db
        .collection("Personas")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          const personas = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          for (let i = 0; i < personas.length; i++) {
            participants.push({
              label: personas[i].role,
              checked: false
            })
          }
          setPersonas(participants);
        });
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, [activeProduct, showDrawer]);

  const setJourney = (journeyName) => {
    const journeyIndex = findIndex(journeys, (r) => r.name === journeyName);

    if (journeyIndex > -1) {
      setActiveJourney(journeys[journeyIndex]);
    }
  };

  const setJourneyStart = (dateTime) => {
    console.log(dateTime);

    if (dateTime?._d) {
      const start = new Date(dateTime._d).toISOString();
      setActiveJourney({
        ...activeJourney,
        journeyName:
          activeJourney.journeyName ||
          `Default_name ${data[activeProduct].length}`,
        start,
      });
    }
  };

  const getDuration = (e) => {
    setActiveJourney({
      ...activeJourney,
      journeyName:
        activeJourney.journeyName ||
        `Default_name ${data[activeProduct].length}`,
      duration: +e.target.value || 0,
    });
  };

  const handleTypeSelect = (type) => {
    setActiveJourney({
      ...activeJourney,
      durationType: type,
    });
  };

  const onAddJourney = (name) => {
    const newJ = {
      durationType,
      duration,
      start: new Date().toISOString(),
      name: capitalize(newJourney),
      product_id: activeProduct.id,
    };
    // console.log(newJ)

    if(duration !== "" && name !== "") {
      db.collection("Journeys")
        .add(newJ)
        .then(() => {
          setNewJourney("");
          setDuration("");
          setDurationType("");
          setAddJourney(false);
        });
    } else {
      message.error("Please fill all required field");
    }
  };

  const addEvent = (event) => {
    console.log(event)
    const data = {
      journey_id: activeJourney.id,
      ...event,
    };
    db.collection("journeyEvents")
      .add(data)
      .then(() => {
        setShowDrawer(false);
      });
  };

  const checkJourney = () => {
    return (
      activeJourney?.start &&
      activeJourney?.duration &&
      activeJourney?.durationType
    );
  };

  const onClickAddEvt = async () => {
    await fetchPersonas();
    setShowDrawer(true);
  };

  const onCancel = () => {
    setNewJourney("");
    setDuration("");
    setDurationType("");
    if(journeys.length >= 1) {
      setAddJourney(false);
    }
  };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero journey" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        rightNavItems={rightNav}
        activeRightItem={activeJourney?.name}
        hasMainAdd
        hasSideAdd
        onSideAdd={() => setAddJourney(true)}
        onMainAdd={
          checkJourney()
            ? onClickAddEvt
            : () => alert("Configure journey details")
        }
        type="text"
        mainClass="mr-[152px]"
        setActiveRightNav={setJourney}
        defaultText={activeJourney ? activeJourney.name : "Add"}
        breadCrumbItems={splitRoutes(pathname)}
        addNewText={<p className="flex items-center">Add Event</p>}
      >
        {addJourney ? (
          <div className="h-[450px] flex items-center justify-center">
            <form onSubmit={onAddJourney}>
              <div className="w-[320px]">
                <div>
                  <h3 className="text-[24px] font-bold">Create Journey</h3>
                  <p className="text-[14px] text-[#595959]">
                    Please provide a name
                  </p>
                  <Input
                    value={newJourney}
                    onChange={(e) => setNewJourney(e.target.value)}
                    required
                  />
                </div>

                <p className="text-[14px] text-[#595959] mt-8">
                  How long does this take end to end?
                </p>
                <div className="flex items-center justify-between space-x-3">
                  <InputNumber
                    value={duration}
                    onChange={(value) => setDuration(value)}
                    className="w-full"
                    required
                  />
                  <Select
                    defaultValue="days"
                    onChange={(value) => setDurationType(value)}
                    className="w-full"
                  >
                    <Option value="minutes">Minutes</Option>
                    <Option value="hours">Hours</Option>
                    <Option value="days">Days</Option>
                    <Option value="week">Weeks</Option>
                    <Option value="month">Months</Option>
                    <Option value="year">Years</Option>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 mt-[43px]">
                  <Button
                    size="small"
                    type="danger"
                    ghost
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#4A801D] text-white"
                    size="small"
                    // onClick={onAddJourney}
                    htmlType="submit"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <>
            {activeJourney && events && (
              <Chart journey={activeJourney} events={events} />
            )}

            {/* {!activeJourney?.start ||
        (activeJourney?.start && !events?.length) ? (
          <div
            style={{ minHeight: "50vh" }}
            className="flex items-center justify-center"
          >
            <div>
              <h1 className="text-[24px] leading-[32px] font-[600]">
                Journey Settings
              </h1>
              <p className="text-[14px] leading-[22px] font-[400] mt-[10px] mb-[27px]">
                How long does this take end to end ?
              </p>
              <div className="flex items-center justify-between">
                <Input
                  className="max-w-[102px] mr-[28px]"
                  type="number"
                  min="0"
                  value={activeJourney?.duration}
                  onChange={setDuration}
                  placeholder="5"
                />

                <Select
                  className="min-w-[112px] mr-[28px]"
                  placeholder="Time Picker"
                  value={activeJourney?.durationType}
                  onChange={handleTypeSelect}
                >
                  <Option value="second">Seconds</Option>
                  <Option value="minute">Minutes</Option>
                  <Option value="hour">Hours</Option>
                  <Option value="day">Days</Option>
                  <Option value="week">Weeks</Option>
                  <Option value="month">Months</Option>
                  <Option value="year">Years</Option>
                </Select>

                <DatePicker showTime onChange={setJourneyStart} />
              </div>
            </div>
          </div>
        ) : null} */}

            {personas && activeJourney && (
              <AddEvent
                onAdd={addEvent}
                journeyStart={activeJourney?.start}
                journeyDur={activeJourney?.duration}
                journeyType={activeJourney?.durationType}
                onCancel={() => setShowDrawer(false)}
                showDrawer={showDrawer}
                personas={personas}
              />
            )}
          </>
        )}
      </AppLayout>
    </div>
  );
}
