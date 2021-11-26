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
      {children}
    </div>
  );
};

export default Layout;
