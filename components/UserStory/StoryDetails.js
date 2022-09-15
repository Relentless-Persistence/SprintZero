/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db, serverTimestamp } from "../../config/firebase-config";

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
  message,
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
import StoryComments from "./StoryComments";
import {useAuth} from "../../contexts/AuthContext"

const Story = styled.p`
  padding: 12px 19px;
  background: #fff;
  color: #262626;
  border: 1px solid #d9d9d9;
`;

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

const StoryDetails = ({
  story,
  storyIndex,
  featureIndex,
  i,
  handleChangeStory,
}) => {
  const {user} = useAuth();
  const [commentType, setCommentType] = useState("design");
  const [comments, setComments] = useState(null);
  const [comment, setComment] = useState("");
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  const [data, setData] = useState([...init]);
  const [flagged, setFlagged] = useState(false);

  const fetchComments = () => {
    if (story) {
      db.collection("storiesComments")
        .where("story_id", "==", story.id)
        .where("type", "==", commentType)
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          console.log(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  }

  const submitComment = () => {
    const data = {
        story_id: story.id,
        author: {
          name: user.displayName,
          avatar: user.photoURL,
        },
        comment: comment,
        type: commentType,
        createdAt: serverTimestamp,
      }
    db.collection("storiesComments")
      .add(data)
      .then((docRef) => {
        message.success("Comment added successfully");
        setComment("");
      })
      .catch((error) => {
        message.error("Error adding comment");
      });
  };
  

  useEffect(() => {
    fetchComments()
  }, [story, commentType])

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

  const onFlag = async () => {
    await db.collection("Ethics").add({
      storyId: story.id,
      type: "identified",
    });
    message.success("Story flagged");
  };

  const checkFlag = async () => {
    const flag = await db
      .collection("Ethics")
      .where("storyId", "==", story.id)
      .get();
    if (flag.empty) {
      setFlagged(false);
    } else {
      setFlagged(true);
    }
  };

  useEffect(() => {
    checkFlag();
  }, [story]);

  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Title>User Story</Title>

        <Story>{story.description}</Story>

        <Title className="mt-[24px]">Acceptance Criteria</Title>

        <div className="max-h-[140px] overflow-y-auto">
          {story?.acceptance_criteria?.map((d, i) => (
            <p key={i}>
              <AppCheckbox checked={d.completed}>{d.name}</AppCheckbox>
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
              checked={commentType === "design"}
              onChange={() => setCommentType("design")}
              value={commentType}
            >
              Design
            </RadioButton>
            <RadioButton
              checked={commentType === "code"}
              onChange={() => setCommentType("code")}
              value={commentType}
            >
              Code
            </RadioButton>
          </Radio.Group>
        </div>

        <StoryComments comments={comments} />

        {user && (
          <Comment
            avatar={
              <Avatar src={user.photoURL} alt="avatar" />
            }
            content={
              <Form onFinish={submitComment}>
                <Form.Item>
                  <TextArea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
                </Form.Item>

                <Form.Item>
                  <Button
                    className="inline-flex justify-between items-center mr-[8px]"
                    type="submit"
                    disabled={comment.length < 2}
                    onClick={submitComment}
                  >
                    <SendOutlined />
                    Post
                  </Button>

                  <Button
                    className="inline-flex items-center justify-between"
                    danger
                    disabled={flagged}
                    onClick={onFlag}
                  >
                    <FlagOutlined />
                    Flag
                  </Button>
                </Form.Item>
              </Form>
            }
          />
        )}
      </Col>
    </Row>
  );
};

export default StoryDetails;
