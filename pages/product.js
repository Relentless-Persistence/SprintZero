import React from "react";
import Head from "next/head";
import ProductConfiguration from "../components/ProductConfiguration";
import { Typography, Avatar } from "antd";
const { Title, Text } = Typography;
import withAuth from "../hoc/withAuth";
import Script from "next/script";

const product = () => {
  return (
    <div>
      <Head>
        <title>Product Configuration | Sprint Zero</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <Script
        async
        type="text/javascript"
        src="https://cdn.weglot.com/weglot.min.js"
        onLoad={() => {
          Weglot.initialize({
            api_key: process.env.NEXT_PUBLIC_WEGLOT_API_KEY,
          });
        }}
      /> */}

      <ProductConfiguration />
    </div>
  );
};

export default withAuth(product);
