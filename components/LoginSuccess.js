import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, message, Typography } from "antd";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

const LoginSuccess = () => {
  const { user } = useAuth();
  const router = useRouter();

  const displayName = (name) => {
    const firstName = name.split(" ");

    return firstName[0];
  };

  if (!user) {
    return "Loading..."
  } 

  return (
    <>
      <div className="mt-10 flex items-center justify-center">
        <div>
          <Title level={1}>Welcome, {displayName(user.displayName)}</Title>
          <Text className="text-sm font-semibold">
            {"Let's help you configure your product."}
          </Text>
        </div>
      </div>
      <div className="text-center mt-10">
        <Button size="large" type="primary" ghost onClick={() => router.push('/product')}>
          <span className="uppercase">Configure Product</span>
        </Button>
      </div>
    </>
  )
};

export default LoginSuccess;
