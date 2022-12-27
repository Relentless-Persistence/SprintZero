import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, message, Typography } from "antd";
import { useRouter } from "next/router";
import Loading from '../components/Loading'

const { Title, Text } = Typography;

const LoginSuccess = () => {
  const { user } = useAuth();
  const router = useRouter();

  const displayName = (name) => {
    const firstName = name.split(" ");

    return firstName[0];
  };

  if (!user) {
    return (
      <div className="relative">
        <Loading />
      </div>
    )
  }

  return (
    <>
      <div className="mt-10 flex items-center justify-start">
        <div>
          <Title level={1} style={{ marginBottom: "12px" }}>Feature Review</Title>
          <Text className="text-primary text-2xl font-semibold">Userbase</Text>
        </div>
      </div>

      <div
        className="absolute bottom-10 right-0 flex items-center"
        style={{ padding: "0 153px" }}
      >
        <Button disabled className="mr-3">
          Skip
        </Button>
        <Button type="primary" onClick={() => router.push("/product")}>
          Start
        </Button>
      </div>
    </>
  );
};

export default LoginSuccess;
