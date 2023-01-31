import {useState} from "react"
import {Row, Col, Input, Form, Drawer, message} from "antd5"

import {Title} from "~/components/Dashboard/SectionTitle"
import ActionButtons from "~/components/Personas/ActionButtons"
import AppCheckbox from "~/components/AppCheckbox"

import {db} from "~/config/firebase"
import {collection, addDoc} from "firebase9/firestore"
import { notification } from "antd5"

const {TextArea} = Input

const AddItem = ({show, setShow, product, user, type}) => {
	const [actions, setActions] = useState([])
	const [form] = Form.useForm()
	const [title, setTitle] = useState()
	const [description, setDescription] = useState()
	const [addAction, setAddAction] = useState(false)
	const [val, setVal] = useState("")

	const handleFinish = async () => {
		const data = {
			title,
			description,
			type,
			product_id: product,
			user: {
				id: user.id,
				name: user.name,
				photo: user.avatar || "https://joeschmoe.io/api/v1/random",
			},
			actions,
		}

		if (title && description) {
      await addDoc(collection(db, "Retrospectives"), data)
				.then((docRef) => {
          notification.success({messgae: "Retrospective submitted successfully"})
					setShow(false)
					setActions([])
					setVal()
					form.resetFields()
				})
				.catch((error) => {
          notification.error({message: "Error adding Retrospective"})
				})
		}
	}

	const handleChange = (e, field) => {
		setData({
			...data,
			[field]: e.target.value,
		})
	}

	const handleKeyDown = (e) => {
		// let newActions = [...actions]
		if (e.key === "Enter") {
			let newActions = [...actions]
			newActions.push({
				name: e.target.value,
				completed: false,
			})
			setVal()
			setActions(newActions)
			setAddAction(false)
		}
	}

	return (
		<Drawer
			open={show}
			destroyOnClose={true}
			closable={false}
			placement={"bottom"}
			headerStyle={{background: "#F5F5F5"}}
			title={
				<Row>
					<Col span={12}>
						<h1 className="font-semibold">Retrospective Item</h1>
					</Col>
					<Col className="flex items-center justify-end" span={12}>
						<ActionButtons onCancel={() => setShow(false)} onSubmit={handleFinish} />
					</Col>
				</Row>
			}
		>
			<Form form={form} name="add_retro">
				<Row gutter={[24, 24]}>
					<Col span={13}>
						<Title className="mb-[8px]">Title</Title>

						<Form.Item
							name="title"
							rules={[
								{
									required: true,
									message: "Please input a subject",
								},
							]}
						>
							<Input value={title} onChange={(e) => setTitle(e.target.value)} />
						</Form.Item>

						<Title className="mb-[8px] mt-[24px]">Proposed Actions</Title>

						<div>
							<Row>
								{actions.map((a, i) => (
									<Col span={8}>
										<AppCheckbox key={a.label} checked={a.checked}>
											{a.name}
										</AppCheckbox>
									</Col>
								))}
								{addAction ? (
									<Col span={8}>
										<Input onKeyPress={handleKeyDown} onChange={(e) => setVal(e.target.value)} value={val} />
									</Col>
								) : (
									<Col span={8}>
										<AppCheckbox checked={false} onChange={() => setAddAction((s) => !s)}>
											<span className="text-[#BFBFBF]">Add New</span>
										</AppCheckbox>
									</Col>
								)}
							</Row>
						</div>
					</Col>
					<Col span={11}>
						<Title className="mb-[8px]">Description</Title>

						<Form.Item
							name="description"
							rules={[
								{
									required: true,
									message: "Please input a description",
								},
							]}
						>
							<TextArea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Drawer>
	)
}

export default AddItem
