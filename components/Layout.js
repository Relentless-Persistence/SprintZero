import React from "react";
import { Typography, Avatar, Image } from "antd";
const { Title, Text } = Typography;
import { useAuth } from "../contexts/AuthContext";

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="mb-8" style={{ padding: "50px 153px" }}>
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/sprintzero-657f3.appspot.com/o/Dark.png?alt=media&token=48f74ba5-b0cc-4026-803c-ca8c8d727eda"
        alt="Logo"
        className="w-[178px] h-[42px]"
        preview={false}
      />
      {children}
    </div>
  );
};

export default Layout;
