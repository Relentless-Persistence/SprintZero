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
  Space,
} from "antd";
import ResizeableDrawer from "../../components/Dashboard/ResizeableDrawer";

import {
  SendOutlined,
  FlagOutlined,
  CloseOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Title } from "../Dashboard/SectionTitle";
import AppCheckbox from "../AppCheckbox";
import RadioButton from "../AppRadioBtn";
import StoryComments from "../UserStory/StoryComments";
import { useAuth } from "../../contexts/AuthContext";
import EditStory from "./EditStory";
import { formatDistance } from "date-fns";

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

const DrawerTitle = styled(Row)`
  h3 {
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    display: inline-block;
    margin-right: 10px;
    color: #262626;
  }
`;

const CloseTime = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  p {
    color: #a6ae9d;
  }
`;

const Index = styled.span`
  width: 32px;
  height: 32px;
  border: 1px solid #101d06;
  background: #fff;
  text-align: center;
  margin: auto;
  border-radius: 50%;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledTag = styled(Tag)`
  background: ${(props) => props.background || "#F5F5F5"};
  border: ${(props) => (props.$border ? "1px solid #BFBFBF" : "")};
  color: ${(props) => props.$textColor || "#262626"} !important;
  font-weight: 600;
  font-size: 14px;
  line-height: 22px;
`;

const { TextArea } = Input;

const StoryDetails = ({
  story,
  setStory,
  visible,
  setVisible,
  fetchSprints,
  activeProduct,
}) => {
  const { user } = useAuth();
  const [commentType, setCommentType] = useState("design");
  const [comments, setComments] = useState(null);
  const [comment, setComment] = useState("");
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  const [data, setData] = useState([...init]);
  const [flagged, setFlagged] = useState(false);
  const [editView, setEditView] = useState(false);
  const [storyDescription, setStoryDescription] = useState(story.description);
  const [versions, setVersions] = useState(null);
  const [name, setName] = useState(story.name);
  const [effort, setEffort] = useState(story.effort);
  const [version, setVersion] = useState(story.epic.version);
  const [status, setStatus] = useState(story.sprint_status);
  const [designLink, setDesignLink] = useState(story.design_link);
  const [codeLink, setCodeLink] = useState(story.code_link);

  const getLastUpdate = (date) => {
    if (date)
      return (
        "Last Updated " +
        formatDistance(new Date(date), new Date(), { includeSeconds: true }) +
        " ago"
      );
  };

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
    };
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
    fetchComments();
  }, [story, commentType]);

  const addItemDone = async (e) => {
    if (e.key === "Enter" && val.trim()) {
      await story.epic.features[story.featureIndex].stories[
        story.storyIndex
      ].acceptance_criteria.push({
        name: val,
        completed: false,
      });

      story.epic.features[story.featureIndex].stories[
        story.storyIndex
      ].updatedAt = new Date().toISOString();

      console.log(
        story.epic.features[story.featureIndex].stories[story.storyIndex]
          .acceptance_criteria
      );

      await db
        .collection("Epics")
        .doc(story.epic.id)
        .update(story.epic)
        .then(() => {
          fetchSprints();
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

  const getVersions = async () => {
    if (activeProduct) {
      db.collection("Versions")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setVersions(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  useEffect(() => {
    getVersions();
  }, [activeProduct, story]);

  const checkAcceptanceCriteria = async (i) => {
    story.epic.features[story.featureIndex].stories[
      story.storyIndex
    ].acceptance_criteria[i].completed =
      !story.epic.features[story.featureIndex].stories[story.storyIndex]
        .acceptance_criteria[i].completed;

    story.epic.features[story.featureIndex].stories[
      story.storyIndex
    ].updatedAt = new Date().toISOString();

    console.log(
      story.epic.features[story.featureIndex].stories[story.storyIndex]
        .acceptance_criteria[i].completed
    );

    await db
      .collection("Epics")
      .doc(story.epic.id)
      .update(story.epic)
      .then(() => {
        fetchSprints();
        message.success("story updated successfully");
      });
  };

  const updateStoryDescription = async (e) => {
    if (e.key === "Enter") {
      story.epic.features[story.featureIndex].stories[
        story.storyIndex
      ].description = storyDescription;

      story.epic.features[story.featureIndex].stories[
        story.storyIndex
      ].updatedAt = new Date().toISOString();

      console.log(
        story.epic.features[story.featureIndex].stories[story.storyIndex]
          .description
      );

      await db
        .collection("Epics")
        .doc(story.epic.id)
        .update(story.epic)
        .then(() => {
          fetchSprints();
          message.success("story updated successfully");
        });
    }
  };

  const updateStory = async () => {
    story.epic.features[story.featureIndex].stories[story.storyIndex].name =
      name;

    story.epic.features[story.featureIndex].stories[story.storyIndex].effort =
      effort;

    story.epic.features[story.featureIndex].stories[story.storyIndex].version =
      version;

    story.epic.features[story.featureIndex].stories[
      story.storyIndex
    ].sprint_status = status;

    story.epic.features[story.featureIndex].stories[
      story.storyIndex
    ].design_link = designLink;

    story.epic.features[story.featureIndex].stories[
      story.storyIndex
    ].code_link = codeLink;

    story.epic.features[story.featureIndex].stories[
      story.storyIndex
    ].updatedAt = new Date().toISOString();

    console.log(story.epic);

    await db
      .collection("Epics")
      .doc(story.epic.id)
      .update(story.epic)
      .then(() => {
        fetchSprints();
        message.success("story updated successfully");
        setEditView(false);
      });
  };

  return !editView ? (
    <ResizeableDrawer
      headerStyle={{ background: "#F5F5F5" }}
      title={
        <DrawerTitle gutter={[16, 16]}>
          <Col span={12}>
            <h3>{story.name}</h3>
            <StyledTag color="#91D5FF"># points total</StyledTag>
            <StyledTag color="#A4DF74">$0.00 total</StyledTag>
            <Space>
              <a href={story.design_link} target="_blank" rel="noreferrer">
                <Button
                  size="small"
                  className="mr-1 flex items-center justify-center bg-[#096DD9] hover:bg-[#096DD9] focus:bg-[#096DD9] text-white hover:text-white focus:text-white space-x-2 outline-none hover:outline-none"
                  icon={<LinkOutlined className="text-white" />}
                  disabled={story.design_link.length <= 0}
                >
                  Design
                </Button>
              </a>
              <a href={story.code_link} target="_blank" rel="noreferrer">
                <Button
                  size="small"
                  className="mr-2 flex items-center justify-center bg-[#096DD9] hover:bg-[#096DD9] focus:bg-[#096DD9] text-white hover:text-white focus:text-white space-x-2 outline-none hover:outline-none"
                  icon={<LinkOutlined />}
                  disabled={story.code_link.length <= 0}
                >
                  Code
                </Button>
              </a>
            </Space>
            <button
              className="text-[#1890FF]"
              onClick={() => setEditView(true)}
            >
              Edit
            </button>
          </Col>
          <Col className="flex items-center justify-end" span={12}>
            <CloseTime>
              <p className="text-[12px] mr-[11px] leading-[16px] !text-[#101D06]">
                {story && getLastUpdate(story.updatedAt)}
              </p>
              <CloseOutlined
                style={{
                  color: "#101D06",
                  fontSize: "12px",
                }}
                onClick={() => setVisible(false)}
              />
            </CloseTime>
          </Col>
        </DrawerTitle>
      }
      placement={"bottom"}
      closable={false}
      onClose={() => {
        setStory(null);
        setVisible(false);
      }}
      visible={visible}
    >
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
          className="max-h-[350px] overflow-y-auto pr-[20px]"
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
    </ResizeableDrawer>
  ) : (
    <ResizeableDrawer
      headerStyle={{ background: "#F5F5F5" }}
      title={
        <DrawerTitle gutter={[16, 16]}>
          <Col span={12} className="space-x-4">
            <h3>{story.name}</h3>
            <Button disabled># points total</Button>
            <Button disabled>$0.00 total</Button>
          </Col>
        </DrawerTitle>
      }
      placement={"bottom"}
      closable={false}
      onClose={() => {
        setStory(null);
        setVisible(false);
      }}
      visible={visible}
      extra={
        <Space>
          <Button onClick={() => setEditView(false)}>Cancel</Button>
          <Button type="primary" danger onClick={updateStory}>
            Done
          </Button>
        </Space>
      }
    >
      {versions && (
        <EditStory
          story={story}
          versions={versions}
          name={name}
          setName={setName}
          effort={effort}
          setEffort={setEffort}
          version={version}
          setVersion={setVersion}
          status={status}
          setStatus={setStatus}
          designLink={designLink}
          setDesignLink={setDesignLink}
          codeLink={codeLink}
          setCodeLink={setCodeLink}
        />
      )}
    </ResizeableDrawer>
  );
};

export default StoryDetails;
