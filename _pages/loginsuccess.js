import React from "react";
import Head from "next/head";
import AuthLayout from "../components/AuthLayout";
import LoginSuccess from "../components/LoginSuccess";
import withAuth from "../hoc/withAuth";

const loginsuccess = () => {
  return (
    <div>
      <Head>
        <title>Login Success | Sprint Zero</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AuthLayout>
        <LoginSuccess />
      </AuthLayout>
    </div>
  );
};

export default withAuth(loginsuccess);
