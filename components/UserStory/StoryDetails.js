/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { db, serverTimestamp } from "../../config/firebase-config";

import {
  Avatar,
  Form,
  Comment,
  Button,
  Input,
  Row,
  Col,
  Radio,
  message,
} from "antd";

import {
  SendOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { Title } from "../Dashboard/SectionTitle";
import AppCheckbox from "../AppCheckbox";
import RadioButton from "../AppRadioBtn";
import StoryComments from "./StoryComments";
import { useAuth } from "../../contexts/AuthContext";
import { activeProductState } from "../../atoms/productAtom";
import { useRecoilValue } from "recoil";





const { TextArea } = Input;

const StoryDetails = ({
  story,
  storyIndex,
  featureIndex,
  epic,
}) => {
  const { user } = useAuth();
  const activeProduct = useRecoilValue(activeProductState);
  const [commentType, setCommentType] = useState("design");
  const [comments, setComments] = useState(null);
  const [comment, setComment] = useState("");
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  // const [data, setData] = useState([...init]);
  const [flagged, setFlagged] = useState(false);
  const [storyDescription, setStoryDescription] = useState(story.description);
  // const [designLink, setDesignLink] = useState(story.design_link);
  // const [codeLink, setCodeLink] = useState(story.code_link);

  const fetchComments = () => {
    if (story) {
      db.collection("storiesComments")
        .where("story_id", "==", story.id)
        .where("type", "==", commentType)
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

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
      product_id: activeProduct.id,
    };
    db.collection("storiesComments")
      .add(data)
      .then(() => {
        message.success("Comment added successfully");
        setComment("");
      })
      .catch(() => {
        message.error("Error adding comment");
      });
  };

  useEffect(() => {
    fetchComments();
  }, [story, commentType]);

  const addItemDone = async (e) => {
    if (e.key === "Enter" && val.trim()) {
      await epic.features[featureIndex].stories[
        storyIndex
      ].acceptance_criteria.push({
        name: val,
        completed: false,
      });

      epic.features[featureIndex].stories[
        storyIndex
      ].updatedAt = new Date().toISOString();

      await db
        .collection("Epics")
        .doc(epic.id)
        .update(epic)
        .then(() => {
          message.success("story updated successfully");
        });

      setVal("");
      setShow(false);
    }
  };

  const onChange = (e) => {
    setVal(e.target.value);
  };

  const onFlag = async () => {
    epic.features[featureIndex].stories[storyIndex].flagged =
      !epic.features[featureIndex].stories[storyIndex].flagged;

    epic.features[featureIndex].stories[storyIndex].ethics_status = "Identified"

    await db
      .collection("Epics")
      .doc(epic.id)
      .update(epic)
      .then(() => {
        message.success("Story has been flagged");
      });
  };

  const checkFlag = async () => {
    if (story) {
      if (epic.features[featureIndex].stories[storyIndex].flagged) {
        setFlagged(true);
      } else {
        setFlagged(false);
      }
    }
  };

  useEffect(() => {
    checkFlag();
  }, [story]);

  const checkAcceptanceCriteria = async (i) => {
    epic.features[featureIndex].stories[
      storyIndex
    ].acceptance_criteria[i].completed =
      !epic.features[featureIndex].stories[storyIndex]
        .acceptance_criteria[i].completed;

    epic.features[featureIndex].stories[
      storyIndex
    ].updatedAt = new Date().toISOString();

    await db
      .collection("Epics")
      .doc(epic.id)
      .update(epic)
      .then(() => {
        message.success("story updated successfully");
      });
  };

  const updateStoryDescription = async (e) => {
    if (e.key === "Enter") {
      epic.features[featureIndex].stories[
        storyIndex
      ].description = storyDescription;

      epic.features[featureIndex].stories[
        storyIndex
      ].updatedAt = new Date().toISOString();

      await db
        .collection("Epics")
        .doc(epic.id)
        .update(epic)
        .then(() => {
          // fetchSprints();
          message.success("story updated successfully");
        });
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Title>User Story</Title>

        <TextArea
          value={storyDescription}
          onChange={(e) => setStoryDescription(e.target.value)}
          onKeyPress={updateStoryDescription}
          rows={3}
        />

        <Title className="mt-[24px]">Acceptance Criteria</Title>

        <div className="max-h-[140px] overflow-y-auto">
          <Row>
            {story?.acceptance_criteria?.map((d, i) => (
              <Col span={8} key={i}>
                <AppCheckbox
                  checked={d.completed}
                  onChange={() => checkAcceptanceCriteria(i)}
                >
                  <span className={d.completed ? "line-through" : null}>
                    {d.name}
                  </span>
                </AppCheckbox>
              </Col>
            ))}

            {show ? (
              <Col span={8}>
                <Input
                  value={val}
                  onKeyPress={addItemDone}
                  onChange={onChange}
                />
              </Col>
            ) : (
              <Col span={8}>
                <AppCheckbox
                  checked={false}
                  onChange={() => setShow((s) => !s)}
                >
                  <span className="text-[#BFBFBF]">Add Item</span>
                </AppCheckbox>
              </Col>
            )}
          </Row>
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
            avatar={<Avatar src={user.photoURL} alt="avatar" />}
            content={
              <Form onFinish={submitComment}>
                <Form.Item>
                  <TextArea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
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
