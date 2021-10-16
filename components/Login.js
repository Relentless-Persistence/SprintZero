import React from "react";
import { useRouter } from "next/router";
import { Button, Typography } from "antd";
import {GoogleOutlined, WindowsFilled} from "@ant-design/icons"

const { Title, Text } = Typography;

const Login = () => {
  return (
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
        <Button className="flex items-center m-10 font-semibold" size="large">
          <GoogleOutlined className="text-xl text-red-400 mr-4" /> Sign in with
          Google
        </Button>
        <Button className="flex items-center font-semibold" size="large">
          <WindowsFilled className="text-xl text-blue-600" />
          Sign in with Microsoft
        </Button>
      </div>
    </>
  );
};

export default Login;
