import "antd/dist/antd.css";

import "../styles/globals.css";

import { AuthProvider } from "../contexts/AuthContext";
import { PaymentProvider } from "../contexts/PaymentContext";
import { RecoilRoot } from "recoil";
import { useLayoutEffect, useState, useEffect } from "react";
import { useWindowSize } from "react-use";

function MyApp({ Component, pageProps }) {
  const { width } = useWindowSize();

  if (width < 1132) {
    return (
      <div className="w-full h-full flex justify-center items-center text-lg p-8">
        Sorry, we don&apos;t support your current resolution at the moment.
        Please try either turning your device sideways to landscape mode or
        share with a device wider than 1133px.
      </div>
    );
  } else {
    return (
      <AuthProvider>
        <PaymentProvider>
          <RecoilRoot>
            <Component {...pageProps} />
          </RecoilRoot>
        </PaymentProvider>
      </AuthProvider>
    );
  }
}

export default MyApp;
