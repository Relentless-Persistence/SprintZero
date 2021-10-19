import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import ProductConfiguration from "../components/ProductConfiguration";

const product = () => {
  return (
    <div>
      <Head>
        <title>Product Configuration | Sprint Zero</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <ProductConfiguration />
      </Layout>
    </div>
  );
};

export default product;
