import React, {useState} from 'react';
import { ArcherElement } from "react-archer";
import { Input, Tag } from 'antd';
import {
  ReadOutlined,
  CopyOutlined,
  FileOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";

const Epic = ({epic, i, addEpic, handleChangeEpic}) => {
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
        >
          <Input
            placeholder="New Epic"
            type="text"
            maxLength="16"
            className="max-w-[70px] bg-transparent border-none outline-none focus:outline-none placeholder:text-[#4F2DC8] p-0"
            value={epic.name}
            onChange={(e) => handleChangeEpic(i, e.target.value)}
          />
        </Tag>
      </ArcherElement>
    </div>
  );
}

export default Epic;
