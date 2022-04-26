/* eslint-disable react-hooks/rules-of-hooks */
import React, {useState} from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { splitRoutes } from "../../../utils";
import AppLayout from "../../../components/Dashboard/AppLayout";
import Billings from "../../../components/Settings/Billings";
import { findIndex } from "lodash";

export default function billing() {
  const router = useRouter();
  const { pathname } = useRouter();
  const menus = ["Account", "Billing", "Config", "Team"];
  const [activeMenuIndex, setActiveMenuIndex] = useState(1);

  const setActiveRightNav = (h) => {
    const menuTypeIndex = findIndex(menus, (o) => o === h);
    router.push(`/dashboard/settings/${menus[menuTypeIndex].toLowerCase()}`);
  };
  return (
    <div className="mb-8">
      <Head>
        <title>Billings Settings | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy accessiblity" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        hasMainAdd={true}
        addNewText="Update"
        onMainAdd={() => alert("I am working on it")}
        hasSideAdd={false}
        breadCrumbItems={splitRoutes(pathname)}
        ignoreLast={true}
        mainClass="mr-[110px]"
        rightNavItems={menus}
        activeRightItem={menus[activeMenuIndex]}
        setActiveRightNav={setActiveRightNav}
      >
        <Billings />
      </AppLayout>
    </div>
  );
}
