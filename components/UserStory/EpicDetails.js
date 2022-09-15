import React, { useState } from "react";
import { Row, Col, Input, Checkbox, Tag } from "antd";
// import EpicComments from "./EpicComments";

const { TextArea } = Input;

const options = [
  { label: "Create a new task", value: "Create a new task" },
  {
    label: "Create a reminder, then look at it in your inbox",
    value: "Create a reminder, then look at it in your inbox",
  },
  { label: "Learn the Calendar view", value: "Learn the Calendar view" },
];

const EpicDetails = ({ epic }) => {
  const [designComments, setDesignComments] = useState(true);
  const [CommentType, setCommentType] = useState(
    designComments ? "design" : "code"
  );

  return (
    <div>
      <Row gutter={[48]}>
        <Col span={12} className="space-y-2">
          <h3 className="font-semibold text-[20px]">User Story</h3>
          <TextArea
            value={
              "As a user I need to be aware of any issues with the platform so that I can pre-emptivly warn attendees and provide any new contact information to join the meeting"
            }
          />

          <h3 className="font-semibold text-[20px]">Acceptance Criteria</h3>

          <div className="flex flex-col items-start justify-start">
            <Checkbox>Create a new task</Checkbox>
            <Checkbox>
              Create a reminder, then look at it in your inbox
            </Checkbox>
            <Checkbox>Learn the Calendar view</Checkbox>
            <Checkbox disabled>
              <div className="text-[#BFBFBF]">Add Item</div>
            </Checkbox>
          </div>
        </Col>

        <Col span={12}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[20px]">Comments</h3>

            <div>
              <Tag
                className={
                  designComments
                    ? "font-semibold text-sm text-[#4A801D] border-[#4A801D] px-2 cursor-pointer"
                    : "text-sm text-black px-2 -ml-2 cursor-pointer"
                }
                onClick={() => {
                  setDesignComments(true);
                  setCommentType("design");
                }}
              >
                Design
              </Tag>
              <Tag
                className={
                  !designComments
                    ? "font-semibold text-sm text-[#4A801D] border-[#4A801D] px-2 cursor-pointer -ml-2"
                    : "text-sm text-black px-2 -ml-2 cursor-pointer"
                }
                onClick={() => {
                  setDesignComments(false);
                  setCommentType("code");
                }}
              >
                Code
              </Tag>
            </div>
          </div>
          {/* <EpicComments type={CommentType} /> */}
        </Col>
      </Row>
    </div>
  );
};

export default EpicDetails;
