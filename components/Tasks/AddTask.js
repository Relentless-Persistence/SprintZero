import React, { useState } from "react";
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
  notification,
} from "antd5";
import { SendOutlined, FlagOutlined, UserOutlined } from "@ant-design/icons";
import AppCheckbox from "~/components/AppCheckbox"
import ActionButtons from "../../components/Personas/ActionButtons";
import { CardTitle } from "../../components/Dashboard/CardTitle";
import DrawerSubTitle from "../../components/Dashboard/DrawerSubTitle";
import { db } from "../../config/firebase-config";
import { activeProductState } from "../../atoms/productAtom";
import moment from "moment"

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

const AddTask = ({ createMode, setCreateMode, product, order, board}) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");

  const handleDrawerDateChange = (date, dateString) => {
    setDate(dateString);
  };

  const handleDrawerTimeChange = (time, timeString) => {
    setTime(timeString);
  };

  const addItemDone = async (e) => {
    if (e.key === "Enter") {
      subtasks.push({
        name: val,
        completed: false,
      });
      setShow(false);
      setVal("")
    }
    
  }

  const createTask = () => {
    const data = {
      title,
      subject,
      description,
      date,
      time,
      status: "Backlog",
      product_id: product,
      order,
      board,
      subtasks
    }

    db.collection("tasks")
      .add(data)
      .then((docRef) => {
        notification.success({message: "Task created successfully"})
        setTitle("")
        setSubject("")
        setDescription("")
        setDate("")
        setTime("");
        setCreateMode(false);
        setSubtasks([])
      })
      .catch((error) => {
        notification.error({message: "Error creating new task"})
        console.log(error)
      });
  }

  return (
		<Drawer
			open={createMode}
			closable={false}
			placement={"bottom"}
			headerStyle={{background: "#F5F5F5"}}
			title={
				<Row>
					<Col span={21}>
						<CardTitle className="mr-[10px] inline-block">Create a Task</CardTitle>
					</Col>

					<Col span={3}>
						<div className="flex justify-end">
							<ActionButtons onCancel={() => setCreateMode(false)} onSubmit={() => createTask(false)} />
						</div>
					</Col>
				</Row>
			}
		>
			<Row gutter={[24, 24]} className="mt-[15px]">
				<Col span={8}>
					<div>
						<DrawerSubTitle>Title</DrawerSubTitle>

						<Input
							className="mb-[24px]"
							onChange={(e) => setTitle(e.target.value)}
							value={title}
							maxLength="50"
							required
						/>

						<DrawerSubTitle>Description</DrawerSubTitle>

						<TextArea onChange={(e) => setDescription(e.target.value)} value={description} rows={4} required />
					</div>
				</Col>
				<Col span={8}>
					<DrawerSubTitle>Due</DrawerSubTitle>

					<div className="mb-[24px]">
						<DatePicker className="mr-[8px]" onChange={handleDrawerDateChange} format={"MM-DD-YYYY"} required />
						<TimePicker onChange={handleDrawerTimeChange} format={"HH:mm:ss"} required />,
					</div>
				</Col>

				<Col span={8}>
					<DrawerSubTitle>Subtasks</DrawerSubTitle>
					<div>
						{subtasks?.map((subtask, i) => (
							<div key={subtask.name}>
								<AppCheckbox checked={subtask.completed}>
									<span className={subtask.completed ? `line-through` : null}>{subtask.name}</span>
								</AppCheckbox>
							</div>
						))}
						{show ? (
							<Input value={val} onKeyPress={addItemDone} onChange={(e) => setVal(e.target.value)} />
						) : (
							<AppCheckbox checked={false} onChange={() => setShow((s) => !s)}>
								<span className="text-[#BFBFBF]">Add Item</span>
							</AppCheckbox>
						)}
					</div>
				</Col>
			</Row>
		</Drawer>
	)
};

export default AddTask;