/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReadOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Divider, message, Tag, Button } from "antd";
import update from "immutability-helper";
import { ArcherContainer, ArcherElement } from "react-archer";
import { last } from "lodash";
import Epic from "./Epic";
import Feature from "./Feature";
import Story from "./Story";
import { db } from "../../config/firebase-config";
import { activeProductState } from "../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import generateString from '../../utils/generateRandomStrings';
import {debounce} from "lodash";

const UserStory = ({ epics, setEpics, activeProduct, version }) => {

  const addEpic = () => {
    setEpics([
      ...epics,
      {
        id: generateString(20),
        name: "",
        features: [],
        product_id: activeProduct.id,
        version: version.id
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
              id: generateString(20),
              name: "",
              status: "",
              stories: [],
            },
          ],
        },
      },
    })


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

  const handleChangeFeatureStatus = (epicIndex, featureIndex, e) => {
    if (e.key === "Enter") {
      const newData = update(epics, {
        [epicIndex]: {
          features: {
            [featureIndex]: {
              status: {
                $set: "saved",
              },
            },
          },
        },
      });

      setEpics(newData);
    }
  };

  const addStory = (epicIndex, featureIndex) => {
    const id = generateString(20);
    const newData = update(epics, {
      [epicIndex]: {
        features: {
          [featureIndex]: {
            stories: {
              $push: [
                {
                  id: id,
                  name: "",
                  description: "",
                  status: "",
                  version: version.id,
                  sprint_id: "",
                  sprint_status: "Backlog",
                  flagged: false,
                  ethics_status: "",
                  ethics_votes: {accepts: 0, rejects: 2},
                  acceptance_criteria: [],
                  effort: "",
                  design_link: "",
                  code_link: ""
                },
              ],
            },
          },
        },
      },
    });

    setEpics(newData);
  };

  // const updateStory = async (e, id) => {
  //   await db.collection("Stories").doc(id).update({
  //     name: e,
  //   })
  // }

  const handleChangeStory = (epicIndex, featureIndex, storyIndex, e, story) => {
    console.log(e, story)
    const newData = update(epics, {
      [epicIndex]: {
        features: {
          [featureIndex]: {
            stories: {
              [storyIndex]: {
                name: {
                  $set: e,
                },
              },
            },
          },
        },
      },
    });
    // debounce(() => updateStory(e, story.id), 3000)
    setEpics(newData);
  };

  const handleChangeStoryStatus = (epicIndex, featureIndex, storyIndex, e) => {
    if (e.key === "Enter") {
      const newData = update(epics, {
        [epicIndex]: {
          features: {
            [featureIndex]: {
              stories: {
                [storyIndex]: {
                  status: {
                    $set: "saved",
                  },
                },
              },
            },
          },
        },
      });
      setEpics(newData);
    }
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

      <div id="sprint0Dashboard" className="flex justify-center mt-8">
        <div className="flex justify-center space-x-10 overflow-x-auto">
          {epics &&
            epics.map((epic, i) => (
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
                    <div className="flex justify-center space-x-4">
                      {epic.features.length <= 0 ? (
                        <ArcherElement id={"add_feature"}>
                          <Tag
                            className="flex items-center space-x-1 border-2 border-[#006378] border-dashed px-[8px] py-[4px] text-[#006378] text-sm rounded cursor-pointer"
                            icon={<CopyOutlined />}
                            onClick={() => addFeature(i)}
                            style={{width:"200px"}}
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
                              handleChangeFeatureStatus={
                                handleChangeFeatureStatus
                              }
                            />
                            <ArcherElement
                              id={`${feature.id}-1`}
                              relations={[
                                {
                                  targetId: feature.id,
                                  targetAnchor: "bottom",
                                  sourceAnchor: "top",
                                  style: {
                                    strokeWidth: "1.5",
                                    //strokeDasharray: "4,3",
                                    endShape: {
                                      arrow: {
                                        arrowLength: 4,
                                        arrowThickness: 1.5,
                                      },
                                    },
                                    lineStyle: 'straight',
                                    endMarker: false,
                                  },
                                },
                              ]}
                            >
                              <div className="mt-[42.5px] flex flex-col p-[14px] border-2 border-[#0073B3] rounded">
                                {feature.name === "" ? null : (
                                  <>
                                    {feature.stories.length <= 0
                                      ? null
                                      : feature.stories.map(
                                          (story, storyIndex) => (
                                            <div key={story.id}>
                                              <Story
                                                featureIndex={featureIndex}
                                                story={story}
                                                storyIndex={storyIndex}
                                                i={i}
                                                epic={epic}
                                                addStory={addStory}
                                                handleChangeStory={
                                                  handleChangeStory
                                                }
                                                handleChangeStoryStatus={
                                                  handleChangeStoryStatus
                                                }
                                              />
                                            </div>
                                          )
                                        )}
                                    <Tag
                                      className="flex items-center space-x-1 border-2 border-[#0073B3] border-dashed px-[8px] py-[4px] text-[#0073B3] text-sm rounded cursor-pointer"
                                      onClick={() => addStory(i, featureIndex)}
                                    >
                                      Add Story
                                    </Tag>
                                  </>
                                )}
                              </div>
                            </ArcherElement>
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

        <div className="space-x-10 overflow-x-auto">
          <Tag
            className="flex items-center space-x-1 border-2 border-[#4F2DC8] border-dashed px-[8px] ml-5 py-[4px] text-[#4F2DC8] text-sm rounded cursor-pointer"
            icon={<ReadOutlined />}
            onClick={addEpic}
          >
            Add Epic
          </Tag>
        </div>
      </div>
    </>
  );
};

// AG: added sprint0Dashboard id - fix that permanently

export default UserStory;
