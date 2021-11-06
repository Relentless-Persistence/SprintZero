import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import ProductConfiguration from "../components/ProductConfiguration";
import { Typography } from "antd";
const { Title, Text } = Typography;

const product = () => {
  return (
    <div>
      <Head>
        <title>Product Configuration | Sprint Zero</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ padding: "0 153px", marginTop: "50px" }}>
        <Title level={2} className="logo">
          Sprint Zero
        </Title>
      </div>

      <ProductConfiguration />
    </div>
  );
};

export default product;
