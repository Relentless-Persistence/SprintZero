/* eslint-disable react-hooks/rules-of-hooks */
import React, {useState} from 'react';
import Head from "next/head";
import AppLayout from "../../../../components/Dashboard/AppLayout";
import { splitRoutes } from "../../../../utils";
import { useRouter } from "next/router";
import Account from "../../../../components/Settings/Account";
import { findIndex } from "lodash";

const account = () => {
  const router = useRouter();
  const { pathname } = useRouter();
  const menus = ["Account", "Billing", "Config", "Team"]
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);

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

      <AppLayout
        ignoreLast={true}
        hasMainAdd={false}
        hasSideAdd={false}
        breadCrumbItems={splitRoutes(pathname)}
        mainClass="mr-[110px]"
        rightNavItems={menus}
        activeRightItem={menus[activeMenuIndex]}
        setActiveRightNav={setActiveRightNav}
      >
        <Account />
      </AppLayout>
    </div>
  );
}

export default account;
