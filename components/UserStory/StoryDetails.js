import React, { useState } from "react";
import styled from "styled-components";

import {
  List,
  Avatar,
  Form,
  Comment,
  Button,
  Input,
  Row,
  Tag,
  Col,
  Radio,
} from "antd";

import {
  LikeOutlined,
  DislikeOutlined,
  CopyOutlined,
  CloseOutlined,
  SendOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { Title } from "../Dashboard/SectionTitle";
import AppCheckbox from "../AppCheckbox";
import RadioButton from "../AppRadioBtn";

const Story = styled.p`
  padding: 12px 19px;
  background: #fff;
  color: #262626;
  border: 1px solid #d9d9d9;
`;

const comments = [
  [
    {
      author: "Han Solo",
      avatar: "https://joeschmoe.io/api/v1/random",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
    },
    {
      author: "Han Solo",
      avatar: "https://joeschmoe.io/api/v1/random",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
    },
  ],
  [
    {
      author: "Jane Doe",
      avatar: "https://joeschmoe.io/api/v1/random",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
    },
    {
      author: "Han Solo",
      avatar: "https://joeschmoe.io/api/v1/random",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
    },
  ],
];

const init = [
  {
    label: "Connect with Amy",
    checked: true,
  },
  {
    label: "Request Data from Finance Dept",
    checked: false,
  },
  {
    label: "Send sheet to John",
    checked: true,
  },
  {
    label: "Finalize presentation",
    checked: false,
  },
];

const { TextArea } = Input;

const StoryDetails = ({ story }) => {
  const [commentsIndex, setCommentsIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  const [data, setData] = useState([...init]);

  const addItemDone = (e) => {
    if (e.key === "Enter" && val.trim()) {
      setData([
        ...data,
        {
          label: val,
          checked: false,
        },
      ]);

      setVal("");
      setShow(false);
    }
  };

  const onChange = (e) => {
    setVal(e.target.value);
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Title>User Story</Title>

        <Story>
          As a user I need to be aware of any issues with the platform so that I
          can pre-emptively warn attendees and provide any new contact
          information to join the meeting
        </Story>

        <Title className="mt-[24px]">Acceptance Criteria</Title>

        <div className="max-h-[140px] overflow-y-auto">
          {data.map((d, i) => (
            <p key={i}>
              <AppCheckbox checked={d.checked}>{d.label}</AppCheckbox>
            </p>
          ))}

          {show ? (
            <Input value={val} onKeyPress={addItemDone} onChange={onChange} />
          ) : (
            <AppCheckbox checked={false} onChange={() => setShow((s) => !s)}>
              <span className="text-[#BFBFBF]">Add Item</span>
            </AppCheckbox>
          )}
        </div>
      </Col>

      <Col
        className="max-h-[250px] overflow-y-scroll pr-[20px]"
        offset={1}
        span={11}
      >
        <div className="flex items-center justify-between">
          <Title>Comments</Title>

          <Radio.Group size="small">
            <RadioButton
              checked={commentsIndex === 0}
              onChange={() => setCommentsIndex(0)}
              value={0}
            >
              Design
            </RadioButton>
            <RadioButton
              checked={commentsIndex === 1}
              onChange={() => setCommentsIndex(1)}
              value={1}
            >
              Code
            </RadioButton>
          </Radio.Group>
        </div>

        <List
          className="comment-list"
          itemLayout="horizontal"
          dataSource={comments[commentsIndex]}
          renderItem={(item) => (
            <li>
              <Comment
                actions={item.actions}
                author={item.author}
                avatar={item.avatar}
                content={item.content}
              />
            </li>
          )}
        />

        <Comment
          avatar={
            <Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
          }
          content={
            <>
              <Form.Item>
                <TextArea rows={2} />
              </Form.Item>

              <Form.Item>
                <Button
                  className="inline-flex justify-between items-center mr-[8px]"
                  disabled
                >
                  <SendOutlined />
                  Post
                </Button>

                <Button
                  className="inline-flex items-center justify-between"
                  danger
                >
                  <FlagOutlined />
                  Flag
                </Button>
              </Form.Item>
            </>
          }
        />
      </Col>
    </Row>
  );
};

export default StoryDetails;
