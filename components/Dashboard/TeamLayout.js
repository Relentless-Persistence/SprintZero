import React, { useState } from "react";
import styled from "styled-components";
import {
  Layout,
  Breadcrumb,
  Input,
  Divider,
  Button,
  Menu,
  Dropdown,
  message,
  notification,
  Tooltip,
} from "antd";
import { UserAddOutlined, CopyOutlined } from "@ant-design/icons";
import SideBar from "./SideBar";
import AppHeader from "./Header";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase-config";
import { activeProductState } from "../../atoms/productAtom";
import { useRecoilValue } from "recoil";

const { Content, Sider } = Layout;

const Versions = styled.ul`
  list-style: none;
  color: #262626;
  font-size: 16px;
`;

const Version = styled.li`
  border-left-width: 4px;
  border-left-style: solid;
  border-left-color: ${(props) => (props.active ? "#315613" : "#3156131a")};
  cursor: pointer;
  padding-bottom: 28px;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
`;

const AddNew = styled(Button)`
  align-items: center;
  display: flex;
  margin-left: 10px;
  background: #fff;
  overflow: hidden;
`;

const AddSide = styled(Button)`
  background: transparent !important ;
  border: none;
  color: #262626 !important ;
  box-shadow: none;
  font-size: 16px;
  line-height: 24px;
  margin: 0;
  padding: 0;
  text-align: start;
  font-weight: 600;
`;

const capitalize = (text) =>
  `${text[0]?.toUpperCase()}${text?.substring(1).toLowerCase()}`;

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const TeamLayout = ({
  rightNavItems = [],
  activeRightItem = "test",
  breadCrumbItems = [],
  setActiveRightNav,
  onChangeProduct,
  onMainAdd,
  hasMainAdd,
  defaultText,
  onSideAdd,
  hasSideAdd = true,
  hideSideBar = false,
  ignoreLast,
  type,
  addNewText = "Add New",
  addNewClass,
  capitalizeText = true,
  versionClass,
  contentClass = "",
  topExtra = <></>,
  useGrid,
  mainClass,
  breadCrumbClass,
  sideBarClass,
  onSideAddClick,
  children,
}) => {
  const { user } = useAuth();
  const activeProduct = useRecoilValue(activeProductState);
  const [showSideAdd, setShowSideAdd] = useState(false);
  const [inviteType, setInviteType] = useState(null);
  const [token, setToken] = useState(null);
  const [value, setValue] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const toggleSideAdd = () => {
    setShowSideAdd((s) => !s);
  };

  const onEnter = (e) => {
    if (e.key === "Enter" && value.trim()) {
      onSideAdd(value.trim());
      toggleSideAdd();
      setValue("");
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  function handleMenuClick(e) {
    message.info("Click on menu item.");
    console.log("click", e);
  }

  const generateToken = () => {
    let result = " ";
    const charactersLength = characters.length;
    for (let i = 0; i <= 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  };

  const createToken = async (type) => {
    notification.destroy();
    const inviteTypeCode = type === "member" ? "mb" : "vr";
    await db
      .collection("inviteToken")
      .add({
        token: generateToken(),
        type: type,
        product_id: activeProduct.id,
      })
      .then((docRef) => {
        setToken(docRef.id);
        notification.info({
          message: (
            <p className="font-semibold">Please share the URL with invitee</p>
          ),
          description: (
            <div className="flex items-center space-x-3">
              <input
                className="pb-1 border-b-2 border-gray-300 text-lg text-gray-600 outline-none focus:outline-none"
                value={`${window.location.origin}/invite?type=${inviteTypeCode}&token=${docRef.id}`}
                readOnly
                onClick={(e) =>
                  e.target.setSelectionRange(0, e.target.value.length)
                }
              />
              {isCopied ? (
                <span>Copied!</span>
              ) : (
                <Tooltip title={isCopied ? "Copied!" : "Copy"}>
                  <CopyOutlined
                    onClick={() =>
                      handleCopyClick(
                        `${window.location.origin}/invite?type=${inviteTypeCode}&token=${docRef.id}`
                      )
                    }
                    className="text-2xl text-gray-500 cursor-pointer"
                  />
                </Tooltip>
              )}
            </div>
          ),
          className: "w-full",
          placement: "bottomRight",
          duration: 0,
        });
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };

  const invite = async (type) => {
    notification.destroy();
    const inviteTypeCode = type === "member" ? "mb" : "vr";
    const querySnapshot = await db
      .collection("inviteToken")
      .where("type", "==", type)
      .get();
    if (querySnapshot.size > 0) {
      setToken(querySnapshot.docs[0].id);
      notification.info({
        message: (
          <p className="font-semibold">Please share the URL with invitee</p>
        ),
        description: (
          <div className="flex items-center space-x-3">
            <input
              className="pb-1 border-b-2 border-gray-300 text-lg text-gray-600 outline-none focus:outline-none"
              readOnly
              value={`${window.location.origin}/invite?type=${inviteTypeCode}&token=${querySnapshot.docs[0].id}`}
              onClick={(e) => e.target.setSelectionRange(0, e.target.value.length)}
            />
            {isCopied ? (
              <span>Copied!</span>
            ) : (
              <Tooltip title={isCopied ? "Copied!" : "Copy"}>
                <CopyOutlined
                  onClick={() =>
                    handleCopyClick(
                      `${window.location.origin}/invite?type=${inviteTypeCode}&token=${querySnapshot.docs[0].id}`
                    )
                  }
                  className="text-2xl text-gray-500 cursor-pointer"
                />
              </Tooltip>
            )}
          </div>
        ),
        className: "w-full",
        placement: "bottomRight",
        duration: 0,
      });
    } else {
      await createToken(type);
    }
  };

  async function copyTextToClipboard(text) {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  }

  const handleCopyClick = (copyText) => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(copyText)
      .then(() => {
        // If successful, update the isCopied state value
      message.success("Invite link Copied!");
        setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const menu = (
    <Menu>
      <Menu.Item key="0" onClick={() => invite("member")}>
        Member
      </Menu.Item>
      <Menu.Item key="1" onClick={() => invite("viewer")}>
        Viewer
      </Menu.Item>
    </Menu>
  );

  //if ( !user ) return <div>Loading...</div>;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader onChangeProduct={onChangeProduct} />
      <Layout>
        <Sider
          width={200}
          className="site-layout-background"
          breakpoint="sm"
          style={{
            position: "fixed",
            zIndex: 1,
            height: "100%",
            marginTop: "64px",
          }}
        >
          <SideBar />
        </Sider>
        <Layout
          className={mainClass}
          style={{
            marginTop: "65px",
            marginLeft: "200px",
          }}
        >
          <div
            style={
              useGrid
                ? {
                    display: "grid",
                    "grid-template-columns": "minmax(0,1fr) auto",
                  }
                : {}
            }
            className={useGrid ? null : "flex justify-between"}
          >
            <div className={`flex-1 pt-[24px] pl-[42px] pr-[33px]`}>
              <div
                className={`flex justify-between items-center ${breadCrumbClass}`}
              >
                <Breadcrumb>
                  {breadCrumbItems.map((item, i) => (
                    <Breadcrumb.Item key={i}>
                      {capitalize(item)}
                    </Breadcrumb.Item>
                  ))}

                  {ignoreLast ? null : (
                    <Breadcrumb.Item className="text-green-800 ">
                      {capitalizeText
                        ? capitalize(defaultText || activeRightItem)
                        : defaultText || activeRightItem}
                    </Breadcrumb.Item>
                  )}
                </Breadcrumb>

                <div className="flex justify-between items-center">
                  {<div>{topExtra}</div>}

                  <Dropdown.Button
                    overlay={menu}
                    placement="bottomLeft"
                    arrow={{ pointAtCenter: true }}
                    icon={<UserAddOutlined />}
                    className="bg-white"
                    onClick={onMainAdd}
                  >
                    Add New
                  </Dropdown.Button>
                </div>
              </div>

              <Content className={`px-0 pt-[12px]  m-0  ${contentClass}`}>
                {children}
              </Content>
            </div>

            {hideSideBar ? null : (
              <div
              //style={ { minWidth: "180px" } }
              >
                <div
                  className={`fixed right-0 min-w-[100px] max-w-[160px] z-[500] bg-[#F0F2F5] min-h-full max-h-full overflow-y-auto pb-[80px] ${sideBarClass}`}
                >
                  <Versions>
                    {rightNavItems.map((item, i) => (
                      <Version
                        className={`py-[16px] px-[24px] ${versionClass || ""} ${
                          activeRightItem === (item.value || item)
                            ? "font-[600]"
                            : ""
                        }`}
                        key={i}
                        active={activeRightItem === (item.value || item)}
                        onClick={() =>
                          setActiveRightNav(item.value ? item.value : item)
                        }
                      >
                        {item.render ? item.render() : item}
                      </Version>
                    ))}

                    {hasSideAdd && showSideAdd ? (
                      <Version
                        className={`py-[16px] px-[24px] ${versionClass || ""}`}
                      >
                        <Input
                          className="mx-0 my-0 "
                          type={type || "number"}
                          maxLength={20}
                          autoFocus
                          value={value}
                          onChange={handleChange}
                          onKeyPress={onEnter}
                          style={{ maxWidth: "90px" }}
                        />
                      </Version>
                    ) : null}

                    {hasSideAdd && onSideAddClick ? (
                      <Version className="py-[16px] px-[24px]">
                        <AddSide onClick={onSideAddClick}>Add</AddSide>
                      </Version>
                    ) : null}

                    {hasSideAdd && !onSideAddClick ? (
                      <Version className="py-[16px] px-[24px]">
                        <AddSide onClick={toggleSideAdd}>
                          {showSideAdd ? "Close" : "Add"}
                        </AddSide>
                      </Version>
                    ) : null}
                  </Versions>
                </div>
              </div>
            )}
          </div>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default TeamLayout;
