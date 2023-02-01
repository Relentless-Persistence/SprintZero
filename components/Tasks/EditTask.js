/* eslint-disable react-hooks/exhaustive-deps */
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
  Button,
  List,
  DatePicker,
  TimePicker,
  notification,
} from "antd5";
import {Comment} from "antd"
import { SendOutlined, FlagOutlined, UserOutlined } from "@ant-design/icons";
import ActionButtons from "../../components/Personas/ActionButtons";
import { CardTitle } from "../../components/Dashboard/CardTitle";
import DrawerSubTitle from "../../components/Dashboard/DrawerSubTitle";
import { db } from "../../config/firebase-config";
import { useAuth } from "../../contexts/AuthContext";
import moment from "moment";


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

const EditTask = ({ editMode, setEditMode, task, setTask, user }) => {

  const [title, setTitle] = useState(task.title);
  const [subject, setSubject] = useState(task.subject);
  const [description, setDescription] = useState(task.description);
  const [date, setDate] = useState(task.date);
  const [time, setTime] = useState(task.time);
  const [comments, setComments] = useState(null);
  const [comment, setComment] = useState("");
	const [subtasks, setSubtasks] = useState(task.subtasks)
	const [show, setShow] = useState(false)
	const [val, setVal] = useState("")

	console.log("user", user)

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
				subtasks
      })
      .then(() => {
        notification.success({message: "Task updated successfully"})
        setTask(null);
      })
      .catch((error) => {
        console.log(error);
        notification.error({message: "An error occurred!"})
      });
  };

  const fetchComments = () => {
    if (task) {
      console.log("task", task)
      db.collection("tasksComments")
        .where("task_id", "==", task.id)
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          console.log("comments",
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        });
    }
  };

  const submitComment = () => {
    const data = {
      task_id: task.id,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      comment: comment,
      createdAt: new Date().toISOString(),
    };
    db.collection("tasksComments")
      .add(data)
      .then((docRef) => {
        notification.success({message: "Comment added successfully"})
        setComment("");
      })
      .catch((error) => {
        notification.error({message: "Error adding comment"})
      });
  };

  useEffect(() => {
    fetchComments();
  }, [task]);

  const updateSubtask = (i) => {
		let newSubtasks = [...subtasks]
    newSubtasks[i].completed = !newSubtasks[i].completed
		setSubtasks(newSubtasks);
  }

	const addItemDone = async (e) => {
		if (e.key === "Enter") {
			let newSubtasks = [...subtasks]
			newSubtasks.push({
				name: val,
				completed: false,
			})
			setSubtasks(newSubtasks);
			setShow(false)
			setVal("")
		}
	}

  return (
		<ResizeableDrawer
			open={editMode}
			closable={false}
			placement={"bottom"}
			headerStyle={{background: "#F5F5F5"}}
			title={
				<Row>
					<Col span={21}>
						<CardTitle className="mr-[10px] inline-block">Task</CardTitle>
					</Col>

					<Col span={3}>
						<div className="flex justify-end">
							<ActionButtons
								onCancel={() => {
									setTask(null)
									setEditMode(false)
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
						<DrawerSubTitle>Title</DrawerSubTitle>

						<Input className="mb-[24px]" onChange={(e) => setTitle(e.target.value)} value={title} />

						<DrawerSubTitle>Description</DrawerSubTitle>

						<TextArea onChange={(e) => setDescription(e.target.value)} value={description} rows={4} />
					</div>
				</Col>
				<Col span={8}>
					<DrawerSubTitle>Due</DrawerSubTitle>

					<div className="mb-[24px]">
						<DatePicker
							className="mr-[8px]"
							onChange={handleDrawerDateChange}
							defaultValue={moment(task.date, "MM-DD-YYYY")}
							format={"MM-DD-YYYY"}
						/>
						<TimePicker
							onChange={handleDrawerTimeChange}
							defaultValue={moment(task.time, "HH:mm:ss")}
							format={"HH:mm:ss"}
						/>
					</div>

					<DrawerSubTitle>Actions</DrawerSubTitle>
					<SubTasks>
						{subtasks?.map((subtask, i) => (
							<Checkbox key={subtask.name} checked={subtask.completed} onChange={() => updateSubtask(i)}>
								{subtask.name}
							</Checkbox>
						))}

						{show ? (
							<Input value={val} onKeyPress={addItemDone} onChange={(e) => setVal(e.target.value)} />
						) : (
							<Checkbox checked={false} onChange={() => setShow((s) => !s)}>
								<span className="text-[#BFBFBF]">Add New</span>
							</Checkbox>
						)}
					</SubTasks>
				</Col>
				<Col className="pr-[20px]" span={8}>
					<DrawerSubTitle>Discussion</DrawerSubTitle>

					<div>
						{comments && (
							<List
								className=""
								itemLayout="horizontal"
								dataSource={comments}
								renderItem={(item) => (
									<li>
										<Comment
											actions={item.actions}
											author={item.author.name}
											avatar={item.author.avatar}
											content={item.comment}
										/>
									</li>
								)}
							/>
						)}
					</div>

					{user && (
						<Comment
							avatar={<Avatar src={user.avatar} alt="avatar" />}
							content={
								<Form>
									<Form.Item>
										<TextArea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
									</Form.Item>

									<Form.Item>
										<Button
											className="mr-[8px] inline-flex items-center justify-between"
											disabled={comment.length <= 1}
											onClick={submitComment}
										>
											<SendOutlined />
											Post
										</Button>

										<Button
											className="inline-flex items-center justify-between border-[#4A801D] text-[#4A801D]"
											onClick={() => setComment("")}
										>
											<UserOutlined />
											Cancel
										</Button>
									</Form.Item>
								</Form>
							}
						/>
					)}
				</Col>
			</Row>
		</ResizeableDrawer>
	)
};

export default EditTask;
