import React from 'react';
import styled from "styled-components";
import { useRouter } from "next/router";
import { Menu } from "antd";
import Link from "next/link";
import {
  UserOutlined,
  FormOutlined,
  LogoutOutlined,
  DollarOutlined,
  ApiOutlined,
  ShareAltOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {auth} from "../../config/firebase-config";

const isActive = (url, path) => url.toLowerCase().includes(path.toLowerCase());

const MenuItem = styled(Menu.Item)`
  background-color: ${(props) =>
    props.$highlight ? "#F5FBF0" : "tranparent"} !important;
  color: ${(props) => (props.$highlight ? "#4A801D" : "#000")};
  box-shadow: ${(props) =>
    props.$highlight ? "inset -3px 0px 0px #4A801D" : "none"};

  .ant-menu-item-icon {
    color: ${(props) => (props.$highlight ? "#315613" : "#000")};
  }

  &:hover {
    a {
      color: #000 !important;
    }
  }
`;

const SettingsMenu = () => {
  const { pathname } = useRouter();
  const [openKeys, setOpenKeys] = React.useState([pathname.split("/")[2]]);

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };
  return (
    <div className="relative h-full overflow-hidden">
      <Menu
        mode="inline"
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        style={{ height: "100%", borderRight: 0 }}
      >
        <MenuItem
          $highlight={pathname === "/settings/account"}
          key="1"
          icon={<UserOutlined />}
        >
          <Link href="/dashboard/settings/account">
            Account
          </Link>
        </MenuItem>
        <MenuItem
          $highlight={pathname === "/settings/billing"}
          key="2"
          icon={<DollarOutlined />}
        >
          <Link href="/dashboard/settings/billing">
            Billing
          </Link>
        </MenuItem>
        <MenuItem
          $highlight={pathname === "/settings/config"}
          key="1"
          icon={<SettingOutlined />}
        >
          <Link href="/dashboard/settings/config">
            Configuration
          </Link>
        </MenuItem>
        {/* <MenuItem
          $highlight={pathname === "/settings/share"}
          key="1"
          icon={<ShareAltOutlined />}
        >
          <Link href="/dashboard/settings/share">
            Share
          </Link>
        </MenuItem> */}
        <MenuItem
          $highlight={pathname === "/settings/team"}
          key="1"
          icon={<TeamOutlined />}
        >
          <Link href="/dashboard/settings/team">
            Team
          </Link>
        </MenuItem>
        <MenuItem
          $highlight={pathname === "/settings/integrations"}
          key="1"
          icon={<ApiOutlined />}
        >
          <Link href="#">
            Integrations
          </Link>
        </MenuItem>
      </Menu>
      <div className="absolute bottom-[18px] left-[25px] w-full">
        <div className="flex flex-col justify-start space-y-[18px]">
          <div className="flex items-center space-x-2">
            <FormOutlined />
            <span>Support</span>
          </div>
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => auth.signOut()}
          >
            <LogoutOutlined />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsMenu;
