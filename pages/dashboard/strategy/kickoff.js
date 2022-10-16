/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col, Input, Space, Button } from "antd";

import AppLayout from "../../../components/Dashboard/AppLayout";
import {
  ListCard,
  DescriptionCard,
  TimeLineCard,
} from "../../../components/Personas";
import { splitRoutes } from "../../../utils";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { findIndex } from "lodash";

import fakeData from "../../../fakeData/personas.json";
import products from "../../../fakeData/products.json";

// const getCardData = (name, data) => {
//   return [...data?.find((d) => d.name === name)?.list];
// };

export default function Kickoff() {
  const { pathname } = useRouter();
  const activeProduct = useRecoilValue(activeProductState);
  const [kick, setKick] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [rightNav, setRightNav] = useState([]);
  const [newRole, setNewRole] = useState("");

  const fetchKickoff = async () => {
    if (activeProduct) {
      const res = db
        .collection("kickoff")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          if (snapshot.empty) {
            createKickoff();
          } else {
            setKick(
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          }
        });
    }
  };

  useEffect(() => {
    fetchKickoff();
  }, [activeProduct]);

  const createKickoff = async () => {
    await db.collection("kickoff").add({
      product_id: activeProduct.id,
      problem_statement: "",
      success_metrics: [""],
      priorities: [""],
    });

    fetchKickoff();
  };

  const handleEdit = (roleName, cardName, list, id) => {
    let data;

    switch (cardName) {
      case "success_metrics":
        data = {
          success_metrics: list,
        };
        break;
      case "personas":
        data = {
          personas: list,
        };
        break;
      case "priorities":
        data = {
          priorities: list,
        };
        break;
      default:
        break;
    }

    console.log(data);

    db.collection("kickoff").doc(id).update(data);
  };

  const handleProblem = (value, id) => {
    db.collection("kickoff").doc(id).update({ problem_statement: value });
  };

  return (
    <div className="mb-8">
      <Head>
        <title>Kickoff | Sprint Zero</title>
        <meta name="description" content="Sprint Zero kickoff" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        hideSideBar
        // rightNavItems={rightNav}
        breadCrumbItems={splitRoutes(pathname)}
        // activeRightItem={activeRole?.role}
        // capitalizeText={false}
        // setActiveRightNav={setRole}
        // onSideAdd={createRole}
        // hasSideAdd
        // mainClass="mr-[120px]"
        // type="text"
        // sideAddValue={newRole}
        // setSideAddValue={setNewRole}
      >
        {kick && (
          <Row gutter={[16, 16]}>
            <Col xs={{ span: 24 }} sm={{ span: 12 }}>
              <DescriptionCard
                handleEdit={(value) => handleProblem(value, id)}
                title="Problem Statement"
                name={kick[0].id}
                cardData={kick[0].problem_statement}
              />

              <br />

              <ListCard
                handleEdit={(list) =>
                  handleEdit(
                    kick[0].success_metrics,
                    "success_metrics",
                    list,
                    kick[0].id
                  )
                }
                title="Success Metrics"
                cardData={kick[0].success_metrics}
              />

              <br />
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }}>
              <ListCard
                handleEdit={(list) =>
                  handleEdit(kick[0].perosnas, "personas", list, kick[0].id)
                }
                title="Identified Personas"
                cardData={kick[0].personas}
              />

              <br />

              <ListCard
                handleEdit={(list) =>
                  handleEdit(kick[0].priorities, "priorities", list, kick[0].id)
                }
                title="Business Priorities"
                cardData={kick[0].priorities}
              />
            </Col>
          </Row>
        )}
      </AppLayout>
    </div>
  );
}
