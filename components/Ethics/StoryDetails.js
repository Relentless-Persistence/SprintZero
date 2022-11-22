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
  Drawer
} from "antd";
import ResizeableDrawer from "../Dashboard/ResizeableDrawer";

import {
  SendOutlined,
  FlagOutlined,
  CloseOutlined,
  LinkOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import { Title } from "../Dashboard/SectionTitle";
// import AppCheckbox from "../AppCheckbox";
import RadioButton from "../AppRadioBtn";
import StoryComments from "../UserStory/StoryComments";
import { useAuth } from "../../contexts/AuthContext";
import { formatDistance } from "date-fns";
import AppCheckbox from "../../components/AppCheckbox";
import { useSetState } from "react-use";

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
  const [teams, setTeams] = useState(null)
  const [name, setName] = useState(story.name);
  const [effort, setEffort] = useState(story.effort);
  const [version, setVersion] = useState(story.epic.version);
  const [status, setStatus] = useState(story.sprint_status);
  const [designLink, setDesignLink] = useState(story.design_link);
  const [codeLink, setCodeLink] = useState(story.code_link);
  const [accept, setAccept] = useState(false);
  const [reject, setReject] = useState(false);
  const [votingResult, setVotingResult] = useState(null)
  const [votingDone, setVotingDone] = useState(false);

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
      product_id: activeProduct.id,
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

  const fetchTeams = () => {
    if (story) {
      db.collection("teams")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setTeams(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          console.log(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [story]);

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

  const acceptStory = async () => {
    setReject(false);
    setAccept(true)
    story.epic.features[story.featureIndex].stories[
      story.storyIndex
    ].ethics_votes.accepts =
      story.epic.features[story.featureIndex].stories[story.storyIndex]
        .ethics_votes.accepts + 1;

    await db
        .collection("Epics")
        .doc(story.epic.id)
        .update(story.epic)
        .then(() => {
          message.success("story updated successfully");
          checkVotes();
        });
  }

  const rejectStory = async () => {
    setReject(true);
    setAccept(false);
    story.epic.features[story.featureIndex].stories[
      story.storyIndex
    ].ethics_votes.rejects =
      story.epic.features[story.featureIndex].stories[story.storyIndex]
        .ethics_votes.rejects + 1;

    await db
        .collection("Epics")
        .doc(story.epic.id)
        .update(story.epic)
        .then(() => {
          message.success("story updated successfully");
          checkVotes()
        });
  }

  const checkVotes = async () => {
    if(teams) {
      const totalVotes =
        story.epic.features[story.featureIndex].stories[story.storyIndex]
          .ethics_votes.accepts +
        story.epic.features[story.featureIndex].stories[story.storyIndex]
          .ethics_votes.rejects;
      if (
        teams.length === totalVotes &&
        story.epic.features[story.featureIndex].stories[story.storyIndex]
          .ethics_votes.accepts >
          story.epic.features[story.featureIndex].stories[story.storyIndex]
            .ethics_votes.rejects
      ) {
        setVotingDone(true);
        setVotingResult("Allowed");
        story.epic.features[story.featureIndex].stories[story.storyIndex]
          .ethics_status === "Adjuticated";

        await db
          .collection("Epics")
          .doc(story.epic.id)
          .update(story.epic)
          .then(() => {
            message.success("story updated successfully");
          });
      } else if (
        teams.length === totalVotes &&
        story.epic.features[story.featureIndex].stories[story.storyIndex]
          .ethics_votes.accepts <
          story.epic.features[story.featureIndex].stories[story.storyIndex]
            .ethics_votes.rejects
      ) {
        setVotingDone(true);
        setVotingResult("Rejected");
      }

      return;
    }
  }

  useEffect(() => {
    checkVotes();
  }, [teams, story]);

  return (
    <Drawer
      destroyOnClose={true}
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
                onClick={() => {
                  setVisible(false);
                  setStory(null);
                }}
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
      <Row gutter={[16, 0]}>
        <Col span={12}>
          {story.ethics_status !== "Identified" ? (
            <div className="mb-8">
              <Title>Adjudication Response</Title>

              {votingDone ? (
                <Button
                  size="Large"
                  icon={
                    votingResult === "Allowed" ? (
                      <LikeOutlined />
                    ) : (
                      <DislikeOutlined />
                    )
                  }
                  className={`flex items-center justify-center ${
                    votingResult === "Allowed" ? "bg-[#90D855]" : "bg-[#FF7875]"
                  }`}
                >
                  {votingResult}
                </Button>
              ) : (
                <>
                  <p>
                    Do you think this would provide value and reaffirm the
                    commitment to our users?
                  </p>

                  <AppCheckbox checked={accept} onChange={() => acceptStory()}>
                    Allow
                  </AppCheckbox>
                  <AppCheckbox checked={reject} onChange={() => rejectStory()}>
                    Reject
                  </AppCheckbox>
                </>
              )}
            </div>
          ) : null}

          <div>
            <Title>User Story</Title>

            <TextArea
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
              onKeyPress={updateStoryDescription}
              rows={3}
              disabled
            />
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
                  </Form.Item>
                </Form>
              }
            />
          )}
        </Col>
      </Row>
    </Drawer>
  );
};

export default StoryDetails;
