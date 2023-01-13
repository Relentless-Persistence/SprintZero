/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col, Card } from "antd";

import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes, getTimeAgo } from "../../../../utils";

import fakeData from "../../../fakeData/huddleData.json";
import products from "../../../fakeData/products.json";
import HuddleCard from "../../../components/Huddle";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { findIndex } from "lodash";
import { useAuth } from "../../../contexts/AuthContext";
import { isToday, isYesterday } from "date-fns";

function subtractDays(numOfDays, date_today) {
  let datee = new Date(date_today)
  datee.setDate(datee.getDate() - numOfDays);

  return datee;
}

const intervals = [
  "Today",
  "Yesterday",
  "2 days ago",
  "3 days ago",
  "1 week ago",
  "2 weeks ago",
  "1 month ago",
];

// const intervals_dates = new Map([
//   ["Today", new Date()],
//   ["Yesterday", new Date() - 1],
//   ["2 days ago", new Date() -2],
//   ["3 days ago", new Date() -3],
//   ["7 days ago", new Date() -7],
//   ["1 month ago", new Date() - 30],
// ]);

//const today = new Date()

//const today_fixed = new Date();
const today_fixeddd = new Date(new Date().toJSON().slice(0, 10));
const yesterday_fixed = subtractDays(1, today_fixeddd);
const twodaysago_fixed = subtractDays(2, today_fixeddd);
const threedaysago_fixed = subtractDays(3, today_fixeddd);
const oneweekago_fixed = subtractDays(7, today_fixeddd);
const twoweeksago_fixed = subtractDays(14, today_fixeddd);
const onemonthago_fixed = subtractDays(30, today_fixeddd);

const intervals_dictt = {
  "Today": today_fixeddd,
  "Yesterday": yesterday_fixed,
  "2 days ago": twodaysago_fixed,
  "3 days ago": threedaysago_fixed,
  "1 week ago": oneweekago_fixed,
  "2 weeks ago": twoweeksago_fixed,
  "1 month ago": onemonthago_fixed,
};

// const intervals_dictt = [
//   today_fixeddd,
//   yesterday_fixed,
//   twodaysago_fixed,
//   threedaysago_fixed,
//   sevendaysago_fixed,
//   onemonthago_fixed,
// ];

export default function Huddle() {
  const { pathname } = useRouter();
  const user = useAuth();
  const activeProduct = useRecoilValue(activeProductState);

  const [data, setData] = useState([]);
  const [team, setTeam] = useState(null);
  const [blockers, setBlockers] = useState(null);
  const [activeTimeIndex, setActiveTimeIndex] = useState(0);
  const [activeTime, setActiveTime] = useState("Today");
  const [todayInTime, setTodayInTime] = useState(null);
  const [yesterdayInTime, setYesterdayInTime] = useState(null);
  const [blocker, setBlocker] = useState(null);

  // Fetch teams form firebase
  const fetchTeam = () => {
    if (activeProduct) {
      const res = db
        .collection("teams")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setTeam(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
    }
  };

  // Fetch data from firebase
  const fetchHuddles = () => {
    console.log("active product" + activeProduct);
    if (activeProduct) {
      const res = db
        .collection("Huddles")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          
          console.log(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  const fetchHuddleBlockers = () => {
    if (activeProduct) {
      const res = db
        .collection("HuddleBlockers")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setBlockers(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          // console.log(
          //   snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          // );
        });
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchHuddles();
    fetchHuddleBlockers();
    
    setTodayInTime((intervals_dictt[activeTime]).setHours(0,0,0,0))
    setYesterdayInTime((subtractDays(1, intervals_dictt[activeTime])).setHours(0,0,0,0))
    

  }, [activeProduct, activeTime]);

  const setActiveRightNav = (interval) => {
    const huddleIndex = findIndex(intervals, (v) => v === interval);
    if (huddleIndex > -1) {
      setActiveTime(intervals[huddleIndex]);
      setActiveTimeIndex(huddleIndex);
    }
  };

  return (
    <div>
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy huddle" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        hasSideAdd={false}
        // defaultText={getTimeAgo(data.length > 0 ? data[0].createdAt : "Now")}
        rightNavItems={intervals}
        setActiveRightNav={setActiveRightNav}
        activeRightItem={activeTime}
        mainClass="mr-[140px]"
        breadCrumbItems={splitRoutes(pathname)}
      >
        <Row className="max-w-[1200px] overflow-x-auto" gutter={[16, 16]}>
          {team && data && blockers && (
            <>
              {team?.map((item, index) => (
                
                <Col className="flex" key={index} span={8}>
                  <HuddleCard
                    todayInTime={todayInTime}
                    yesterdayInTime={yesterdayInTime}
                    today={data.filter(
                      (huddle) =>
                      
                        huddle.user.uid === item.user.uid &&
                        //isToday(huddle.createdAt)
                        //((intervals_dict[activeTime]).setHours(0,0,0,0) == huddle.createdAt.toDate().setHours(0,0,0,0))
                        (todayInTime == huddle.createdAt.toDate().setHours(0,0,0,0))
                    )}
                    yesterday={data.filter(
                      (huddle) =>
                        huddle.user.uid === item.user.uid &&
                        (yesterdayInTime == huddle.createdAt.toDate().setHours(0,0,0,0))
                        //((subtractDays(1, intervals_dict[activeTime])).setHours(0,0,0,0) == huddle.createdAt.toDate().setHours(0,0,0,0))
                        //isYesterday(huddle.createdAt)
                    )}
                    member={item}
                    product={activeProduct}
                    blockers={blockers.filter(
                      (blocker) => blocker.user.uid === item.user.uid &&
                      (todayInTime == blocker.createdAt.toDate().setHours(0,0,0,0))
                    )}
                  />
                </Col>
              ))}
            </>
          )}
        </Row>
      </AppLayout>
    </div>
  );
}
