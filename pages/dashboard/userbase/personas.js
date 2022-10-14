/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Row, Col } from "antd";

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

export default function Personas() {
  const { pathname } = useRouter();
  const activeProduct = useRecoilValue(activeProductState);
  const [roles, setRoles] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [rightNav, setRightNav] = useState([]);
  const [newRole, setNewRole] = useState("");

  const fetchPersonas = async () => {
    if (activeProduct) {
      const res = db
        .collection("Personas")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setRoles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          const roles = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setActiveRole(roles[0]);
          console.log(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, [activeProduct]);

  const getRoles = () => {
    // return data.map((d) => d.role);
    if (roles) {
      setRightNav(roles.map(({ role }) => role));
    }
  };

  useEffect(() => {
    getRoles();
  }, [roles]);

  const setRole = (roleName) => {
    const roleIndex = findIndex(roles, (r) => r.role === roleName);

    if (roleIndex > -1) {
      setActiveRole(roles[roleIndex]);
    }
  };

  const createRole = () => {
    console.log(newRole);

    db.collection("Personas").add({
      role: newRole,
      product_id: activeProduct.id,
      goals: [""],
      interactions: [""],
      dailyLife: [""],
      tasks: [""],
      responsibilities: [""],
      priorities: [""],
      frustrations: [""],
      changes: [""],
    });
  };

  const handleEdit = (roleName, cardName, list, id) => {
    let data;

    switch (cardName) {
      case "goals":
        data = {
          goals: list,
        };
        break;
      case "interactions":
        data = {
          interactions: list,
        };
        break;
      case "tasks":
        data = {
          tasks: list,
        };
        break;
      case "responsibilities":
        data = {
          responsibilities: list,
        };
        break;
      case "priorities":
        data = {
          priorities: list,
        };
        break;
      case "frustrations":
        data = {
          frustrations: list,
        };
        break;
      case "changes":
        data = {
          changes: list,
        };
        break;
      case "dailyLife":
        data = {
          dailyLife: list,
        };
        break;
      default:
        break;
    }

    console.log(data);

    db.collection("Personas").doc(id).update(data);
  };

  const handleDescription = (value) => {
    console.log(value)
    db.collection("Personas").doc(id).update({ description: value });
  };

  return (
    <div className="mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero personas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        rightNavItems={rightNav}
        breadCrumbItems={splitRoutes(pathname)}
        activeRightItem={activeRole?.role}
        capitalizeText={false}
        setActiveRightNav={setRole}
        onSideAdd={createRole}
        hasSideAdd
        mainClass="mr-[120px]"
        type="text"
        sideAddValue={newRole}
        setSideAddValue={setNewRole}
      >
        {activeRole && (
          <Row gutter={[16, 16]}>
            <Col xs={{ span: 24 }} sm={{ span: 12 }}>
              <ListCard
                handleEdit={(list) =>
                  handleEdit(activeRole.role, "goals", list, activeRole.id)
                }
                title="Goals"
                cardData={activeRole.goals}
              />

              <br />

              <ListCard
                handleEdit={(list) =>
                  handleEdit(
                    activeRole.role,
                    "interactions",
                    list,
                    activeRole.id
                  )
                }
                title="Interactions"
                cardData={activeRole.interactions}
              />

              <br />

              <ListCard
                handleEdit={(list) =>
                  handleEdit(activeRole.role, "tasks", list, activeRole.id)
                }
                title="Tasks"
                cardData={activeRole.tasks}
              />

              <br />

              <ListCard
                handleEdit={(list) =>
                  handleEdit(
                    activeRole.role,
                    "responsibilities",
                    list,
                    activeRole.id
                  )
                }
                title="Responsiblities"
                cardData={activeRole.responsibilities}
              />

              <br />

              <ListCard
                handleEdit={(list) =>
                  handleEdit(activeRole.role, "priorities", list, activeRole.id)
                }
                title="Priorities"
                cardData={activeRole.priorities}
              />

              <br />

              <ListCard
                handleEdit={(list) =>
                  handleEdit(
                    activeRole.role,
                    "frustrations",
                    list,
                    activeRole.id
                  )
                }
                title="Frustations"
                cardData={activeRole.frustrations}
              />

              <br />

              <ListCard
                handleEdit={(list) =>
                  handleEdit(activeRole.role, "changes", list, activeRole.id)
                }
                title="Changes"
                cardData={activeRole.changes}
              />
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 12 }}>
              <DescriptionCard
                handleEdit={(value) => handleDescription(value)}
                title="Description"
                name={activeRole?.id}
                cardData={activeRole?.description}
              />

              <br />

              <TimeLineCard
                handleEdit={(list) =>
                  handleEdit(activeRole.role, "dailyLife", list, activeRole.id)
                }
                title="A Day in the life"
                cardData={activeRole.dailyLife}
              />
            </Col>
          </Row>
        )}
      </AppLayout>
    </div>
  );
}
