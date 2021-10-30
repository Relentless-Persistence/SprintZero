import "antd/dist/antd.css";
import "../styles/globals.css";

import { AuthProvider } from "../contexts/AuthContext";
import { PaymentProvider } from "../contexts/PaymentContext";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <PaymentProvider>
        <Component {...pageProps} />
      </PaymentProvider>
    </AuthProvider>
  );
}

export default MyApp;
