import React, { useState } from "react";
import { FileOutlined, LinkOutlined, CloseOutlined } from "@ant-design/icons";
import { Input, Drawer, Space, Tag } from "antd";
import StoryDetails from "./StoryDetails";

const Story = ({
  story,
  storyIndex,
  featureIndex,
  i,
  handleChangeStory,
  handleChangeStoryStatus,
}) => {
  const [openDetail, setOpenDetail] = useState(false);
  return (
    <div
      key={i}
      className={`flex items-center border-2 border-[#0073B3] cursor-pointer rounded mb-[10px]`}
      onClick={() => (story.status === "saved" ? setOpenDetail(true) : null)}
    >
      <div className="bg-[#0073B3] text-white py-[7px] px-[2px] -ml-[1px]">
        <p className="-rotate-90 text-xs">1.0</p>
      </div>

      <div className="flex items-center justify-center text-[#0073B3] text-[14px] px-[8px]">
        <FileOutlined className="mr-1" />
        {story.status !== "saved" ? (
          <Input
            placeholder="New User Story"
            type="text"
            maxLength="16"
            className="max-w-[70px] focus:outline-none outline-none placeholder:text-[#4F2DC8] bg-transparent capitalize border-none"
            value={story.name}
            onChange={(e) =>
              handleChangeStory(i, featureIndex, storyIndex, e.target.value)
            }
            onKeyDown={(e) =>
              handleChangeStoryStatus(i, featureIndex, storyIndex, e)
            }
          />
        ) : (
          <p className="capitalize">{story.name}</p>
        )}
      </div>
      {story.status === "saved" && (
        <Drawer
          headerStyle={{ background: "#F5F5F5" }}
          title={
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-semibold capitalize">{story.name}</h3>
              <Tag className="font-semibold text-sm text-black bg-[#91D5FF] px-2">
                3 points
              </Tag>
              <Tag className="font-semibold text-sm text-black bg-[#A4DF74] px-2">
                $1,230
              </Tag>
              <Tag
                className="flex items-center px-2 font-semibold text-sm"
                color="#096DD9"
                icon={<LinkOutlined />}
              >
                <span>Design</span>
              </Tag>
              <Tag
                className="flex items-center text-[#BFBFBF] px-2 font-semibold text-sm"
                icon={<LinkOutlined />}
              >
                Code
              </Tag>
              <p className="text-[#1890FF] text-sm cursor-pointer font-semibold">
                Edit
              </p>
            </div>
          }
          closable={false}
          placement="bottom"
          width={"30%"}
          onClose={() => setOpenDetail(false)}
          visible={openDetail}
          maskClosable={true}
          extra={
            <Space>
              <div className="flex items-center space-x-1">
                <p className="text-[#BFBFBF] text-xs">
                  Last modified 2 hrs ago
                </p>
                <CloseOutlined
                  onClick={() => setOpenDetail(false)}
                  className="text-sm cursor-pointer text-[#8C8C8C]"
                />
              </div>
            </Space>
          }
        >
          <StoryDetails story={story} />
        </Drawer>
      )}
    </div>
  );
};

export default Story;
