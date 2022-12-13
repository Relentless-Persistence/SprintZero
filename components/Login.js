/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
// import Image from "next/image";
import { Button, Typography, message, Image } from "antd";
import { GoogleOutlined, WindowsFilled, AppleFilled } from "@ant-design/icons";
import { googleProvider, microsoftProvider, appleProvider } from "../config/authMethods";
import SocialMediaAuth from "../service/auth";
import { auth } from "../config/firebase-config";
import { db } from "../config/firebase-config";
import { useAuth } from "../contexts/AuthContext";
// import { usePaymentConfirm } from "../contexts/PaymentContext";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";

const { Title, Text } = Typography;

const Login = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { type, product } = router.query;
  const { executeRecaptcha } = useGoogleReCaptcha();
  // const paid = usePaymentConfirm();
  const [activeProduct, setActiveProduct] = useState();

  const fetchProducts = async() => {
    if(user) {
      const res = await db
        .collection("Products")
        .where("owner", "==", user.uid)
        .get();
      setActiveProduct(res.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0])
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [user]);

  useEffect(() => {
    if (user && activeProduct) {
      router.push(`/${activeProduct.slug}/dashboard`);
    }
  }, [activeProduct]);

  // const handleOnClick = (provider) => {
  //   try {
  //     auth.signInWithPopup(provider).then(async (res) => {
  //       var user = res.user;
  //       console.log(res);
  //       // Adding user to a product team
  //       if (type && product) {
  //         await db.collection("teams").add({
  //           user: {
  //             uid: user.uid,
  //             email: user.email,
  //             name: user.displayName,
  //             avatar: user.photoURL,
  //           },
  //           expiry: "unlimited",
  //           type: type,
  //           product_id: product,
  //         });
  //       }

  //       // Checking if user is new
  //       if (res.additionalUserInfo.isNewUser) {
  //         // if user has a company custom email
  //         if (!/@gmail.com\s*$/.test(user.email)) {
  //           router.push("/enterprise-contact");
  //         } else {
  //           message.success({
  //             content: "Successfully logged in",
  //             className: "custom-message",
  //           });
  //           router.push("/loginsuccess");
  //         }
  //       } else {
  //         message.success({
  //           content: "Successfully logged in",
  //           className: "custom-message",
  //         });
  //         router.push("/dashboard");
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error.message);
  //     message.error({
  //       content: "An error occurred while trying to log you in",
  //       className: "custom-message",
  //     });
  //   }
  // };

  const handleOnClick = (provider) => {
    try {
      auth.signInWithPopup(provider).then(async (res) => {
        var user = res.user;

        // Checking if user is new
        if (res.additionalUserInfo.isNewUser) {
          // if user has a company custom email
          if (!/@relentlesspersistenceinc.com\s*$/.test(user.email)) {
            message.error({
              content: "Sorry, you can't login at this moment.",
              className: "custom-message",
            });
            await auth.signOut()
            router.push("https://www.sprintzero.app/")
          } else {
            message.success({
              content: "Successfully logged in",
              className: "custom-message",
            });
            router.push("/loginsuccess");
          }
        } else {
          message.success({
            content: "Successfully logged in",
            className: "custom-message",
          });
          router.push(`/${activeProduct.slug}/dashboard`);
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

      {activeProduct && <div className="flex flex-col items-center justify-center space-y-[24px] mt-10">
        <Button
          className="flex items-center justify-start space-x-4 w-[345px] h-[54px] border-black bg-white rounded-[10px] text-[20px] font-semibold"
          onClick={() => handleOnClick(appleProvider)}
          icon={<AppleFilled style={{ fontSize: "20px", marginTop: "-5px" }} />}
        >
          <p>Sign in with Apple</p>
        </Button>
        <Button
          className="flex items-center justify-start space-x-4 w-[345px] h-[54px] border-black bg-white rounded-[10px] text-[20px] font-semibold"
          onClick={() => handleOnClick(googleProvider)}
        >
          <Image
            src="/images/googleIcon.png"
            alt="google"
            width={23}
            height={23}
            preview={false}
          />
          <p>Sign in with Google</p>
        </Button>

        <Button
          className="flex items-center justify-start space-x-4 w-[345px] h-[54px] border-black bg-white rounded-[10px] text-[20px] font-semibold"
          onClick={() => handleOnClick(microsoftProvider)}
        >
          <Image
            src="/images/microsoftIcon.png"
            alt="microsoft"
            width={24}
            height={24}
            preview={false}
          />
          <p>Sign in with Microsoft</p>
        </Button>
      </div>}
      <div className="absolute bottom-20 lg:right-80">
        <Button onClick={() => router.push("/")}>Cancel</Button>
      </div>
    </>
  );
};

export default Login;
