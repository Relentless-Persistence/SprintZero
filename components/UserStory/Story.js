import React, { useState } from "react";
import styled from "styled-components";
import { FileOutlined, LinkOutlined, CloseOutlined } from "@ant-design/icons";
import { Input, Drawer, Row, Col, Tag } from "antd";
import StoryDetails from "./StoryDetails";
import { CardTitle } from "../Dashboard/CardTitle";

const StyledTag = styled(Tag)`
  background: #f5f5f5;
  border: ${(props) => (props.$border ? "1px solid #BFBFBF" : "")};
  color: ${(props) => props.$textColor || "#262626"} !important;
  font-weight: 600;
  font-size: 14px;
  line-height: 22px;
`;

const DrawerTitle = styled(Row)`
  h3 {
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    display: inline-block;
    margin-right: 10px;
    color: #262626;
  }
`;

const CloseTime = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  p {
    color: #a6ae9d;
  }
`;

const Story = ({
  story,
  storyIndex,
  featureIndex,
  i,
  handleChangeStory,
  handleChangeStoryStatus,
}) => {
  const [openDetail, setOpenDetail] = useState(false);
  console.log("story", story);

  const handleDrawerVisible = (value) => {
    let newVal = !openDetail;

    if (value !== undefined) {
      newVal = value;
    }

    console.log(newVal, openDetail);
    setOpenDetail(newVal);
  };

  return (
    <>
      <div
        className={`flex justify-center border-2 border-[#0073B3] cursor-pointer rounded mb-[10px]`}
        onClick={() =>
          story.status === "saved" ? handleDrawerVisible(true) : null
        }
      >
        {/* <div className="bg-[#0073B3] text-white py-[7px] px-[2px] -ml-[1px]">
          <p className="text-xs -rotate-90">1.0</p>
        </div> */}

        <div className="flex items-center justify-center text-[#0073B3] text-[14px] px-[8px]">
          <FileOutlined className="mr-1" />
          {story.status !== "saved" ? (
            <Input
              placeholder="New User Story"
              type="text"
              maxLength="16"
              className="max-w-[70px] focus:outline-none outline-none placeholder:text-[#4F2DC8] pl-0 bg-transparent capitalize border-none"
              value={story.name}
              onChange={(e) => {
                handleChangeStory(i, featureIndex, storyIndex, e.target.value);
              }}
              onKeyDown={(e) => {
                handleChangeStoryStatus(i, featureIndex, storyIndex, e);
              }}
            />
          ) : (
            <p className="capitalize">{story.name}</p>
          )}
        </div>
      </div>

      <Drawer
        headerStyle={{ background: "#F5F5F5" }}
        title={
          <DrawerTitle gutter={[16, 16]}>
            <Col span={12}>
              <h3 className="capitalize">{story.name}</h3>
              <StyledTag color="#91D5FF">3 points</StyledTag>
              <StyledTag color="#A4DF74">$1,230</StyledTag>
              <StyledTag icon={<LinkOutlined />} color="#096DD9">
                Design
              </StyledTag>
              <StyledTag
                $border
                $textColor="#BFBFBF"
                icon={
                  <LinkOutlined
                    style={{
                      color: "#BFBFBF",
                    }}
                  />
                }
              >
                Code
              </StyledTag>
            </Col>
            <Col className="flex items-center justify-end" span={12}>
              <CloseTime>
                <p className="text-[12px] mr-[11px] leading-[16px] !text-[#101D06]">
                  Last modified 2 hrs ago
                </p>
                <CloseOutlined
                  style={{
                    color: "#101D06",
                    fontSize: "12px",
                  }}
                  onClick={() => {
                    //console.log(99);
                    handleDrawerVisible(false);
                  }}
                />
              </CloseTime>
            </Col>
          </DrawerTitle>
        }
        closable={false}
        placement="bottom"
        visible={openDetail}
      >
        <StoryDetails story={{ id: i.toString(), ...story }} />
      </Drawer>
    </>
  );
};

export default Story;
