/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col, Card } from "antd";

import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes, getTimeAgo } from "../../../utils";

import fakeData from "../../../fakeData/huddleData.json";
import products from "../../../fakeData/products.json";
import HuddleCard from "../../../components/Huddle";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { findIndex } from "lodash";
import { useAuth } from "../../../contexts/AuthContext";
import { isToday, isYesterday } from "date-fns";

const intervals = [
  "Today",
  "Yesterday",
  "2 days ago",
  "3 days ago",
  "1 week ago",
  "2 weeks ago",
  "1 month ago",
];

export default function Huddle() {
  const { pathname } = useRouter();
  const user = useAuth();
  const activeProduct = useRecoilValue(activeProductState);

  const [data, setData] = useState([]);
  const [team, setTeam] = useState(null);
  const [blockers, setBlockers] = useState(null);
  const [activeTimeIndex, setActiveTimeIndex] = useState(0);
  const [activeTime, setActiveTime] = useState(intervals[0]);
  const [today, setToday] = useState(null);
  const [yesterday, setYesterday] = useState(null);
  const [blocker, setBlocker] = useState(null);

  // Fetch teams form firebase
  const fetchTeam = async () => {
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
  const fetchHuddles = async () => {
    if (activeProduct) {
      const res = db
        .collection("huddles")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          console.log(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  const fetchHuddleBlockers = async () => {
    if (activeProduct) {
      const res = db
        .collection("huddleBlockers")
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
  }, [activeProduct]);

  const todayFilterInterval = (item) => {
    switch (activeTime) {
      case "Today":
        setToday(
          data.filter(
            (huddle) =>
              huddle.user.uid === item.user.uid &&
              isToday(new Date(huddle.createdAt))
          )
        );
        break;
      default:
        break;
    }
  };

  const yesterdayFilterInterval = (item) => {
    switch (activeTime) {
      case "Today":
        setYesterday(
          data.filter(
            (huddle) =>
              huddle.user.uid === item.user.uid &&
              isYesterday(new Date(huddle.createdAt))
          )
        );
        break;
      default:
        break;
    }
  };

  const blockerFilterInterval = (item) => {
    switch (activeTime) {
      case "Today":
        setBlocker(
          blockers.filter(
            (blocker) =>
              blocker.user.uid === item.user.uid &&
              isToday(new Date(blocker.createdAt))
          )
        );
        break;
      default:
        break;
    }
  };

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
                    today={data.filter(
                      (huddle) =>
                        huddle.user.uid === item.user.uid &&
                        isToday(new Date(huddle.createdAt))
                    )}
                    yesterday={data.filter(
                      (huddle) =>
                        huddle.user.uid === item.user.uid &&
                        isYesterday(new Date(huddle.createdAt))
                    )}
                    member={item}
                    product={activeProduct}
                    blockers={blockers.filter(
                      (blocker) => blocker.user.uid === item.user.uid
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
