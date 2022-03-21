import React, { useState } from "react";
import { ArcherElement } from "react-archer";
import { Input, Tag, Drawer, Space, Button } from "antd";
import {
  ReadOutlined,
  CopyOutlined,
  FileOutlined,
  PlusCircleFilled,
  LinkOutlined,
} from "@ant-design/icons";
import EpicDetails from "./EpicDetails";

const Epic = ({ epic, i, addEpic, handleChangeEpic, handleChangeStatus }) => {
  const [openDetail, setOpenDetail] = useState(false);
  return (
    <div className="flex items-center justify-start">
      <ArcherElement
        id={epic.id}
        relations={
          epic.name === ""
            ? []
            : epic.features.length > 0
            ? []
            : [
                {
                  targetId: "add_feature",
                  targetAnchor: "top",
                  sourceAnchor: "bottom",
                  style: {
                    strokeDasharray: "4,3",
                    endShape: {
                      arrow: {
                        arrowLength: 4,
                        arrowThickness: 1.5,
                      },
                    },
                  },
                },
              ]
        }
      >
        <Tag
          className={`flex items-center justify-center space-x-1 border-2 border-[#4F2DC8] ${
            !epic.name ? "border-dashed" : ""
          } px-[8px] py-[4px] text-[#4F2DC8] text-sm rounded`}
          icon={<ReadOutlined />}
          onClick={() => {
            epic.status === "saved" ? setOpenDetail(true) : null;
          }}
        >
          {epic.status !== "saved" ? (
            <Input
            placeholder="New Epic"
            type="text"
            maxLength="16"
            className="max-w-[70px] bg-transparent border-none outline-none focus:outline-none placeholder:text-[#4F2DC8] p-0"
            value={epic.name}
            onChange={(e) => handleChangeEpic(i, e.target.value)}
            onKeyDown={(e) => handleChangeStatus(i, e)}
          />
          ) : (
            <p>{epic.name}</p>
          )}
        </Tag>
      </ArcherElement>

      {epic.status === "saved" && (
        <Drawer
          title={
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-semibold">{epic.name}</h3>
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
          extra={
            <Space>
              <p className="text-[#BFBFBF] text-xs">Last modified 2 hrs ago</p>
            </Space>
          }
        >
          <EpicDetails epic={epic} />
        </Drawer>
      )}
    </div>
  );
};

export default Epic;
