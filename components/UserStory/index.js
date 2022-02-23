import React, {useState} from 'react';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Divider, Tag } from 'antd';
import update from "immutability-helper";
import { ArcherContainer, ArcherElement } from "react-archer";
import { last } from "lodash";
import Epic from './Epic';

const UserStory = () => {
  const [epics, setEpics] = useState([
    {
      id: Math.floor(Math.random() * 0x1000000).toString(),
      name: "",
      features: [],
    },
  ]);

  const addEpic = () => {
    setEpics([
      ...epics,
      {
        id: Math.floor(Math.random() * 0x1000000).toString(),
        name: "",
        features: [],
      },
    ]);
  };

  const handleChangeEpic = (index, e) => {
    const newData = update(epics, {
      [index]: {
        name: {
          $set: e,
        },
      },
    });

    setEpics(newData);
  };


  return (
    <>
      <div className="flex items-center text-[#A6AE9D] text-[8px] m-0">
        <ArrowLeftOutlined />
        <Divider className="border-[#A6AE9D] border-dashed" />
        <ArrowRightOutlined />
      </div>
      <div className="flex items-center justify-between -mt-4 text-xs text-[#A6AE9D]">
        <p>High Value</p>
        <p className="text-right">Low Value</p>
      </div>

      <div className="flex justify-center mt-8">
        <div className="flex justify-center space-x-10 overflow-x-auto">
          {epics.map((epic, i) => (
            <div key={i}>
              <ArcherContainer strokeColor="#0073B3" noCurves>
                <Epic epic={epic} i={i} addEpic={addEpic} handleChangeEpic={handleChangeEpic} />

                {epic.name === "" ? null : (
                  <div className="mt-[42.5px]">
                    <div className="flex items-center space-x-4">
                      
                    </div>
                  </div>
                )}
              </ArcherContainer>
            </div>
          ))}
        </div>

        <div>
          <Tag
            className="flex items-center space-x-1 border-2 border-[#4F2DC8] border-dashed px-[8px] py-[4px] text-[#4F2DC8] text-sm rounded cursor-pointer"
            icon={<ReadOutlined />}
            // onClick={addEpic}
          >
            Add Epic
          </Tag>
        </div>
      </div>
    </>
  );
}

export default UserStory;
