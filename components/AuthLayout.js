import React from "react";
import { Typography, Avatar, Image } from "antd";
const { Title, Text } = Typography;
import { useAuth } from "../contexts/AuthContext";

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="mb-8" style={{ padding: "50px 153px" }}>
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/sprintzero-657f3.appspot.com/o/Light.png?alt=media&token=ede37d0b-e499-4005-8bd7-7bca97b35235"
        alt="Logo"
        className="w-[178px] h-[42px]"
        preview={false}
      />
      {user ? (
        <div className="flex items-center justify-end -mt-10">
          <Text className="mr-2 capitalize" style={{ fontSize: "16px" }}>
            {user.displayName}
          </Text>
          <Avatar src={user.photoURL} />
        </div>
      ) : null}

      {children}
    </div>
  );
};

export default Layout;
