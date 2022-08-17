import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ResizeableDrawer from "../../components/Dashboard/ResizeableDrawer";
import {
  Input,
  Drawer,
  Tag,
  Checkbox,
  Form,
  Avatar,
  Row,
  Col,
  Comment,
  Button,
  List,
  DatePicker,
  TimePicker,
  message,
} from "antd";
import { SendOutlined, FlagOutlined, UserOutlined } from "@ant-design/icons";
import ActionButtons from "../../components/Personas/ActionButtons";
import { CardTitle } from "../../components/Dashboard/CardTitle";
import DrawerSubTitle from "../../components/Dashboard/DrawerSubTitle";
import { db } from "../../config/firebase-config";

const { TextArea } = Input;

const SubTasks = styled.div`
  .ant-checkbox-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }
  .ant-checkbox-checked .ant-checkbox-inner {
    background: #4a801d;
    border: 1px solid #4a801d;
    border-radius: 2px;
  }
`;

const EditTask = ({ editMode, setEditMode, task, setTask }) => {
  const [title, setTitle] = useState(task.title);
  const [subject, setSubject] = useState(task.subject);
  const [description, setDescription] = useState(task.description);
  const [date, setDate] = useState(task.date);
  const [time, setTime] = useState(task.time);

  const handleDrawerDateChange = (date, dateString) => {
    setDate(dateString);
  };

  const handleDrawerTimeChange = (time, timeString) => {
    setTime(timeString);
  };

  const updateTask = async () => {
    await db
      .collection("tasks")
      .doc(task.id)
      .update({
        title,
        subject,
        description,
        date,
        time,
      })
      .then(() => {
        message.success("Task updated successfully");
        setTask(null);
      })
      .catch((error) => {
        console.log(error);
        message.error("An error occurred!");
      });
  };

  return (
    <ResizeableDrawer
      visible={editMode}
      closable={false}
      placement={"bottom"}
      headerStyle={{ background: "#F5F5F5" }}
      title={
        <Row>
          <Col span={21}>
            <CardTitle className="inline-block mr-[10px]">Task</CardTitle>
          </Col>

          <Col span={3}>
            <div className="flex justify-end">
              <ActionButtons
                onCancel={() => {
                  setTask(null);
                  setEditMode(false);
                }}
                onSubmit={updateTask}
              />
            </div>
          </Col>
        </Row>
      }
    >
      <Row gutter={[24, 24]} className="mt-[15px]">
        <Col span={8}>
          <div>
            <DrawerSubTitle>Subject</DrawerSubTitle>

            <Input
              className="mb-[24px]"
              onChange={(e) => setSubject(e.target.value)}
              value={subject}
            />

            <DrawerSubTitle>Description</DrawerSubTitle>

            <TextArea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              rows={4}
            />
          </div>
        </Col>
        <Col span={8}>
          <DrawerSubTitle>Due</DrawerSubTitle>

          <div className="mb-[24px]">
            <DatePicker
              className="mr-[8px]"
              onChange={handleDrawerDateChange}
            />
            <TimePicker onChange={handleDrawerTimeChange} />,
          </div>

          <SubTasks>
            <Checkbox checked>Lorem ipsum</Checkbox>
            <Checkbox>Amet consectetur adipisicing elit</Checkbox>
            <Checkbox checked>Ipsam repellendus?</Checkbox>
            <Checkbox checked>Inventore perspiciatis ratione</Checkbox>
          </SubTasks>
        </Col>
        <Col className="max-h-[250px] overflow-y-scroll pr-[20px]" span={8}>
          <DrawerSubTitle>Discussion</DrawerSubTitle>

          <List
            className="comment-list"
            itemLayout="horizontal"
            dataSource={[]}
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
                    className="inline-flex justify-between items-center text-[#4A801D]
                                                border-[#4A801D]"
                  >
                    <UserOutlined />
                    Assign
                  </Button>
                </Form.Item>
              </>
            }
          />
        </Col>
      </Row>
    </ResizeableDrawer>
  );
};

export default EditTask;
