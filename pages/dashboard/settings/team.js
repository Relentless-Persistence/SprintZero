/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import TeamLayout from "../../../components/Dashboard/TeamLayout";
import { splitRoutes } from "../../../utils";
import { useRouter } from "next/router";
import Account from "../../../components/Settings/Account";
import { findIndex } from "lodash";
import Team from "../../../components/Settings/Team";
import { db } from "../../../config/firebase-config";
import { activeProductState } from "../../../atoms/productAtom";
import { useRecoilValue, useRecoilState } from "recoil";

const share = () => {
  const router = useRouter();
  const { pathname } = useRouter();
  const activeProduct = useRecoilValue(activeProductState);
  const menus = ["Account", "Billing", "Config", "Team"];
  const [activeMenuIndex, setActiveMenuIndex] = useState(3);
  const [addPerson, setAddPerson] = useState(false);
  const [teams, setTeams] = useState(null);

  const fetchTeams = () => {
    if (activeProduct) {
      db.collection("teams")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setTeams(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          console.log(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [activeProduct]);
  

  const generateToken = () => {
    let result = " ";
    const charactersLength = characters.length;
    for (let i = 0; i <= 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const setActiveRightNav = (h) => {
    const menuTypeIndex = findIndex(menus, (o) => o === h);
    router.push(`/dashboard/settings/${menus[menuTypeIndex].toLowerCase()}`);
  };


  return (
    <div>
      <Head>
        <title>Account Settings | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy accessiblity" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <TeamLayout
        ignoreLast={true}
        hasMainAdd={true}
        addNewText="Add Person"
        onMainAdd={() => setAddPerson(true)}
        hasSideAdd={false}
        breadCrumbItems={splitRoutes(pathname)}
        mainClass="mr-[174px]"
        rightNavItems={menus}
        activeRightItem={menus[activeMenuIndex]}
        setActiveRightNav={setActiveRightNav}
      >
        {teams && <Team teams={teams} />}
      </TeamLayout>
    </div>
  );
};

export default share;
