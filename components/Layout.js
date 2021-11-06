import React from "react";
import { Typography, Avatar } from "antd";
const { Title, Text } = Typography;
import { useAuth } from "../contexts/AuthContext";

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="mb-8" style={{ padding: "50px 153px" }}>
      <Title level={2} className="logo">
        Sprint Zero
      </Title>
      {user ? (
        <div className="flex items-center justify-end -mt-10">
          <Text className="mr-2 capitalize" style={{ fontSize: "16px" }}>{user.displayName}</Text>
          <Avatar src={user.photoURL} />
        </div>
      ) : null}

      {children}
    </div>
  );
};

export default Layout;
