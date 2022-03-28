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
      document.body.innerHTML = `<div class="w-full h-full flex justify-center items-center text-lg p-8">Sorry! We don't work on this device size yet, but we're working on it! Please share this link with a device that has a resolution above 1132 px | iPad Air and above</div>`;
    }

  return (
    <AuthProvider>
      <RecoilRoot>
        <PaymentProvider>
          <Component {...pageProps} />
        </PaymentProvider>
      </RecoilRoot>
    </AuthProvider>
  );
}

export default MyApp;
