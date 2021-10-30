import React, {useEffect} from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button, Typography, message } from "antd";
import { GoogleOutlined, WindowsFilled } from "@ant-design/icons";
import { googleProvider, microsoftProvider } from "../config/authMethods";
import SocialMediaAuth from "../service/auth";
import firebase from "../config/firebase-config";
import { usePaymentConfirm } from "../contexts/PaymentContext";

const { Title, Text } = Typography;

const Login = () => {
  const router = useRouter();
  const auth = firebase.auth();
  const paid = usePaymentConfirm();

  useEffect(() => {
    if(!paid) {
      message.warning("You need to select a plan to login");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [paid])

  const handleOnClick = (provider) => {
    try {
      auth
        .signInWithPopup(provider)
        .then((res) => {
          message.success("Successfully logged in");
        })
        .then(() => router.push("/loginsuccess"));
    } catch (error) {
      console.log(error.message);
      message.error("An error occurred while trying to log you in")
    }
  };

  return (
    paid && (
      <>
        <div className="flex items-center justify-center mb-4">
          <div>
            <Title level={2}>
              Authenticate Yourself Before You Wreck Yourself
            </Title>
            <Text className="text-left">
              Select a provider to create your account
            </Text>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-10">
          <button
            className="googleBtn flex items-center m-10"
            onClick={() => handleOnClick(googleProvider)}
          >
            <Image
              src="https://developers.google.com/identity/sign-in/g-normal.png"
              alt="microsoft"
              width={40.32}
              height={40.32}
            />
            <span style={{ marginLeft: "15px" }}>Sign in with Google</span>
          </button>
          <button
            className="microsoft flex items-center"
            onClick={() => handleOnClick(microsoftProvider)}
          >
            <Image
              src="https://docs.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-azure-ad-apps/ms-symbollockup_mssymbol_19.svg"
              alt="microsoft"
              width={24}
              height={24}
            />
            <span style={{ marginLeft: "15px" }}>Sign in with Microsoft</span>
          </button>
        </div>
      </>
    )
  );
};

export default Login;
