import React, { useState } from "react";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReadOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Divider, Tag } from "antd";
import update from "immutability-helper";
import { ArcherContainer, ArcherElement } from "react-archer";
import { last } from "lodash";
import Epic from "./Epic";
import Feature from "./Feature";

const UserStory = () => {
  const [epics, setEpics] = useState([
    {
      id: Math.floor(Math.random() * 0x1000000).toString(),
      name: "",
      status: "",
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
        status: {
          $set: "saved",
        },
      },
    });

    setEpics(newData);
  };

  const handleChangeStatus = (index, e) => {
    if (e.key === "Enter") {
      const newData = update(epics, {
      [index]: {
        status: {
          $set: "saved",
        },
      },
    });

    setEpics(newData);
    }
    
  };

  const addFeature = (epicIndex) => {
    const newData = update(epics, {
      [epicIndex]: {
        features: {
          $push: [
            {
              id: Math.floor(Math.random() * 0x1000000).toString(),
              name: "",
              stories: [],
            },
          ],
        },
      },
    });

    setEpics(newData);
  };

  const handleChangeFeature = (epicIndex, featureIndex, e) => {
    const newData = update(epics, {
      [epicIndex]: {
        features: {
          [featureIndex]: {
            name: {
              $set: e,
            },
          },
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
                <Epic
                  epic={epic}
                  i={i}
                  addEpic={addEpic}
                  handleChangeEpic={handleChangeEpic}
                  handleChangeStatus={handleChangeStatus}
                />

                {epic.name === "" ? null : (
                  <div className="mt-[42.5px]">
                    <div className="flex items-center space-x-4">
                      {epic.features.length <= 0 ? (
                        <ArcherElement id={"add_feature"}>
                          <Tag
                            className="flex items-center space-x-1 border-2 border-[#006378] border-dashed px-[8px] py-[4px] text-[#006378] text-sm rounded cursor-pointer"
                            icon={<CopyOutlined />}
                            onClick={() => addFeature(i)}
                          >
                            Add Feature
                          </Tag>
                        </ArcherElement>
                      ) : (
                        epic.features.map((feature, featureIndex) => (
                          <div key={feature.id}>
                            <Feature
                              epic={epic}
                              feature={feature}
                              i={i}
                              featureIndex={featureIndex}
                              addFeature={addFeature}
                              handleChangeFeature={handleChangeFeature}
                            />
                          </div>
                        ))
                      )}
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
};

export default UserStory;
