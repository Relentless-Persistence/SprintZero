import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import LoginSuccess from "../components/LoginSuccess";

const loginsuccess = () => {
  return (
    <div>
      <Head>
        <title>Login Success | Sprint Zero</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <LoginSuccess />
      </Layout>
    </div>
  );
};

export default loginsuccess;
