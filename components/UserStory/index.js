/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReadOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Divider, Tag, Skeleton, message } from "antd";
import update from "immutability-helper";
import { ArcherContainer, ArcherElement } from "react-archer";
import { last } from "lodash";
import Epic from "./Epic";
import Feature from "./Feature";
import Story from "./Story";
import { debounce } from "lodash";
import { db } from "../../config/firebase-config";
import { activeProductState } from "../../atoms/productAtom";
import { useRecoilValue } from "recoil";

const UserStory = () => {
  const activeProduct = useRecoilValue(activeProductState);
  const [epics, setEpics] = useState(null);

  const fetchEpics = async () => {
    // console.log(activeProduct.id);
    if (activeProduct) {
      const res = await db
        .collection("Epics")
        .where("product_id", "==", activeProduct.id)
        .get();
        console.log(res)
      const epics = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (epics.length > 0) {
        setEpics(epics);
      } else {
        setEpics([
          {
            id: Math.floor(Math.random() * 0x1000000).toString(),
            name: "",
            status: "",
            features: [],
          },
        ]);
      }
    }
  };

  useEffect(() => {
    fetchEpics();
  }, [activeProduct]);

const persistEpic =  useCallback(
  debounce(async () => {
    await db.collection("Epics").add({...epics});
    message.success("Epic saved");
  }, 5000),
  [],
);

// useEffect(() => {
//   if(epics) {
//     persistEpic();
//   }
// }, [epics]);


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
        // status: {
        //   $set: "saved",
        // },
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
              status: "",
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
    const newData = update(epics, {
      [epicIndex]: {
        features: {
          [featureIndex]: {
            stories: {
              $push: [
                {
                  id: Math.floor(Math.random() * 0x1000000).toString(),
                  name: "",
                  status: "",
                },
              ],
            },
          },
        },
      },
    });

    setEpics(newData);
  };

  const handleChangeStory = (epicIndex, featureIndex, storyIndex, e) => {
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

      {epics && (
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
                                      strokeDasharray: "4,3",
                                      endShape: {
                                        arrow: {
                                          arrowLength: 4,
                                          arrowThickness: 1.5,
                                        },
                                      },
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
                                        onClick={() =>
                                          addStory(i, featureIndex)
                                        }
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

          <div>
            <Tag
              className="flex items-center space-x-1 border-2 border-[#4F2DC8] border-dashed px-[8px] py-[4px] text-[#4F2DC8] text-sm rounded cursor-pointer"
              icon={<ReadOutlined />}
              onClick={addEpic}
            >
              Add Epic
            </Tag>
          </div>
        </div>
      )}
    </>
  );
};

export default UserStory;
