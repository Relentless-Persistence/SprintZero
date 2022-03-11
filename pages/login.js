import React from 'react'
import Head from "next/head";
import Layout from "../components/Layout";
// import Login from '../components/Login';

const login = () => {
  return (
    <div>
      <Head>
        <title>Login | Sprint Zero</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        {/* <Login /> */}
        Login
      </Layout>
    </div>
  );
}

export default login
