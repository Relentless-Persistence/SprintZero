import React from "react";
import Head from "next/head";
import ProductConfiguration from "../components/ProductConfiguration";
import { Typography, Avatar } from "antd";
const { Title, Text } = Typography;

const product = () => {
  return (
    <div>
      <Head>
        <title>Product Configuration | Sprint Zero</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ProductConfiguration />
    </div>
  );
};

export default product;
