import React from "react";
import { CopyOutlined, PlusCircleFilled } from "@ant-design/icons";
import { ArcherElement } from "react-archer";
import { Input, Tag } from "antd";
import { last } from "lodash";

const Feature = ({
  feature,
  i,
  featureIndex,
  addFeature,
  handleChangeFeature,
  epic,
  handleChangeFeatureStatus,
}) => {
  return (
    <div className="flex items-center justify-start">
      <ArcherElement
        key={feature.id}
        id={feature.id}
        relations={[
          {
            targetId: epic.id,
            targetAnchor: "bottom",
            sourceAnchor: "top",
            label:
              last(epic.features) === feature ? (
                <PlusCircleFilled
                  style={{ background: "#f0f2f5" }}
                  className="h-[18px] w-[18px] text-[#4A801D] text-[18px]"
                  onClick={() => addFeature(i)}
                />
              ) : null,
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
        <Tag
          className={`flex items-center space-x-1 border-2 border-[#006378] ${
            !feature.name ? "border-dashed" : ""
          } px-[8px] py-[4px] text-[#006378] text-sm rounded`}
          icon={<CopyOutlined />}
        >
          {/* {feature.status !== "saved" ? ( */}
          <Input
            placeholder="New Feature"
            type="text"
            maxLength="16"
            className="max-w-[70px] capitalize focus:outline-none placeholder:text-[#4F2DC8] p-0 bg-transparent outline-none border-none"
            value={feature.name}
            onChange={(e) =>
              handleChangeFeature(i, featureIndex, e.target.value)
            }
            // onKeyDown={(e) => handleChangeFeatureStatus(i, featureIndex, e)}
          />
          {/* ) : (
            <p>{feature.name}</p>
          )} */}
        </Tag>
      </ArcherElement>
    </div>
  );
};

export default Feature;
