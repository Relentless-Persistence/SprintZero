import React from 'react';
import Head from "next/head";
import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes } from "../../../utils";
import { useRouter } from "next/router";
import Account from "../../../components/Settings/Account";

const account = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useRouter();
  console.log(pathname);
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
      >
        <Account />
      </AppLayout>
      
    </div>
  );
}

export default account;
