import "antd/dist/antd.css";
import "../styles/globals.css";

import { AuthProvider } from "../contexts/AuthContext";
import { PaymentProvider } from "../contexts/PaymentContext";
import { RecoilRoot } from "recoil";

function MyApp({ Component, pageProps }) {
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
