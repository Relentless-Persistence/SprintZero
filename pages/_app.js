/* eslint-disable react-hooks/exhaustive-deps */
import { AuthProvider } from "../contexts/AuthContext";
import { PaymentProvider } from "../contexts/PaymentContext";
import { RecoilRoot } from "recoil";
import { useLayoutEffect, useState, useEffect } from "react";
import { useWindowSize } from "react-use";
import { analytics } from "../config/firebase-config";
import { useRouter } from "next/router";
import Script from "next/script";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import "antd/dist/antd.css";

import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const routers = useRouter();
  useEffect(() => {
    // if (process.env.NODE_ENV === "production") {
    analytics();
    // }
  }, []);

  // Implementing screen_view event
  useEffect(() => {
    const logEvent = (url) => {
      analytics().setCurrentScreen(url);
      analytics().logEvent("screen_view");
    };

    routers.events.on("routeChangeComplete", logEvent);
    //For First Page
    logEvent(window.location.pathname);

    //Remvove Event Listener after un-mount
    return () => {
      routers.events.off("routeChangeComplete", logEvent);
    };
  }, []);

  const { width } = useWindowSize();

  // if (width < 1132) {
  //   return (
  //     <div className="w-full h-full flex justify-center items-center text-lg p-8">
  //       Sorry, we don&apos;t support your current resolution at the moment.
  //       Please try either turning your device sideways to landscape mode or
  //       share with a device wider than 1133px.
  //     </div>
  //   );
  // } else {
  return (
    <>
      <RecoilRoot>
        <AuthProvider>
          <PaymentProvider>
            <GoogleReCaptchaProvider
              reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              scriptProps={{
                async: false, // optional, default to false,
                defer: true, // optional, default to false
                appendTo: "body", // optional, default to "head", can be "head" or "body",
                nonce: undefined,
              }}
            >
              <Component {...pageProps} />
            </GoogleReCaptchaProvider>
          </PaymentProvider>
        </AuthProvider>
      </RecoilRoot>
    </>
  );
}
// }

export default MyApp;
