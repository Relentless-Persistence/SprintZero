import React from "react";
import { Menu } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  HomeOutlined,
  DeploymentUnitOutlined,
  PullRequestOutlined,
  NodeExpandOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

const { SubMenu } = Menu;

const isActive = (url, path) => url.toLowerCase().includes(path.toLowerCase());

const StyledSubMenu = styled(SubMenu)`
  span,
  .ant-menu-submenu-arrow {
    color: #000 !important;
  }
`;

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

const rootSubmenuKeys = ["strategy", "tactics", "operations", "userbase"];

const SideBar = () => {
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
    <Menu
      mode="inline"
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      style={{ height: "100%", borderRight: 0, position: "relative" }}
    >
      <MenuItem
        $highlight={pathname === "/dashboard"}
        key="1"
        icon={<HomeOutlined color="" />}
      >
        <Link href="/dashboard">
          Home
        </Link>
      </MenuItem>
      <StyledSubMenu
        key="strategy"
        icon={<DeploymentUnitOutlined />}
        title="Strategy"
      >
        <MenuItem $highlight={isActive(pathname, "/strategy/kickoff")} key="2">
          <Link href="/dashboard/strategy/kickoff">
            Kickoff
          </Link>
        </MenuItem>
        <MenuItem
          $highlight={isActive(pathname, "/strategy/accessibility")}
          key="3"
        >
          <Link href="/dashboard/strategy/accessibility">
            Accessibility
          </Link>
        </MenuItem>
        <MenuItem
          $highlight={isActive(pathname, "/strategy/objectives")}
          key="4"
        >
          <Link href="/dashboard/strategy/objectives">
            Objectives
          </Link>
        </MenuItem>

        <MenuItem key="5" $highlight={isActive(pathname, "/strategy/visions")}>
          <Link href="/dashboard/strategy/visions">
            Vision
          </Link>
        </MenuItem>
      </StyledSubMenu>
      <StyledSubMenu
        key="tactics"
        icon={<PullRequestOutlined />}
        title="Tactics"
      >
        <MenuItem $highlight={isActive(pathname, "/tactics/ethics")} key="6">
          <Link href="/dashboard/tactics/ethics">
            Ethics
          </Link>
        </MenuItem>
        <MenuItem
          key="7"
          $highlight={isActive(pathname, "/tactics/priorities")}
        >
          <Link href="/dashboard/tactics/priorities">
            Priorities
          </Link>
        </MenuItem>
        <MenuItem key="8" $highlight={isActive(pathname, "/tactics/release")}>
          <Link href="/dashboard/tactics/release">
            Release
          </Link>
        </MenuItem>
        <MenuItem
          key="9"
          $highlight={isActive(pathname, "/tactics/retrospective")}
        >
          <Link href="/dashboard/tactics/retrospective">
            Retrospective
          </Link>
        </MenuItem>
      </StyledSubMenu>
      <StyledSubMenu
        key="operations"
        icon={<NodeExpandOutlined />}
        title="Operations"
      >
        {/* <MenuItem
            key="11"
            $highlight={isActive(pathname, "/operations/calendar")}
          >
            <Link href="/dashboard/operations/calendar">Calendar</Link>
          </MenuItem> */}
        <MenuItem
          key="12"
          $highlight={isActive(pathname, "/operations/huddle")}
        >
          <Link href="/dashboard/operations/huddle">
            Huddle
          </Link>
        </MenuItem>
        {/* <MenuItem
            key="13"
            $highlight={isActive(pathname, "/operations/performance")}
          >
            <Link href="/dashboard/operations/performance">
              <a>Performance</a>
            </Link>
          </MenuItem> */}
        <MenuItem
          key="14"
          $highlight={isActive(pathname, "/operations/sprint")}
        >
          <Link href="/dashboard/operations/sprint">
            Sprint
          </Link>
        </MenuItem>
        <MenuItem key="15" $highlight={isActive(pathname, "/operations/tasks")}>
          <Link href="/dashboard/operations/tasks">
            Tasks
          </Link>
        </MenuItem>
      </StyledSubMenu>
      <StyledSubMenu key="userbase" icon={<UserOutlined />} title="Userbase">
        <MenuItem
          key="16"
          $highlight={isActive(pathname, "/userbase/dialogue")}
        >
          <Link href="/dashboard/userbase/dialogue">
            Dialogue
          </Link>
        </MenuItem>
        <MenuItem
          key="17"
          $highlight={isActive(pathname, "/userbase/journeys")}
        >
          <Link href="/dashboard/userbase/journeys">
            Journeys
          </Link>
        </MenuItem>
        <MenuItem
          key="18"
          $highlight={isActive(pathname, "/userbase/learnings")}
        >
          <Link href="/dashboard/userbase/learnings">
            Learnings
          </Link>
        </MenuItem>

        <MenuItem
          key="19"
          $highlight={isActive(pathname, "/userbase/personas")}
        >
          <Link href="/dashboard/userbase/personas">
            Personas
          </Link>
        </MenuItem>
      </StyledSubMenu>
    </Menu>
  );
};

export default SideBar;
