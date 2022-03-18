import React, { useEffect } from "react";
import { useRouter } from "next/router";
// import Image from "next/image";
import { Button, Typography, message, Image } from "antd";
import { GoogleOutlined, WindowsFilled } from "@ant-design/icons";
import { googleProvider } from "../config/authMethods";
import SocialMediaAuth from "../service/auth";
import {auth} from "../config/firebase-config";
// import { usePaymentConfirm } from "../contexts/PaymentContext";

const { Title, Text } = Typography;

const Login = () => {
  const router = useRouter();
  // const paid = usePaymentConfirm();

  const handleOnClick = (provider) => {
    try {
      auth.signInWithPopup(provider).then((res) => {
        var user = res.user;
        if (!/@gmail.com\s*$/.test(user.email)) {
          router.push("/enterprise-contact");
        } else {
          message.success({
            content: "Successfully logged in",
            className: "custom-message",
          });
          router.push("/loginsuccess");
        }
      });
    } catch (error) {
      console.log(error.message);
      message.error({
        content: "An error occurred while trying to log you in",
        className: "custom-message",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-4">
        <div>
          <Title level={1} style={{ fontWeight: "normal" }}>
            Authenticate Yourself Before You Wreck Yourself
          </Title>
          <Text className="text-xl text-left">
            Select a provider to create your account
          </Text>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mt-10">
        <button
          className="googleBtn flex items-center m-10"
          // onClick={() => handleOnClick(googleProvider)}
        >
          <Image
            src="https://developers.google.com/identity/sign-in/g-normal.png"
            alt="microsoft"
            width={40.32}
            height={40.32}
          />
          <span style={{ marginLeft: "15px" }}>Sign in with Google</span>
        </button>
        {/* <button
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
        </button> */}
      </div>
      <div className="absolute bottom-20 lg:left-80">
        <Button onClick={() => router.push("/")}>Go Back</Button>
      </div>
    </>
  );
};

export default Login;
