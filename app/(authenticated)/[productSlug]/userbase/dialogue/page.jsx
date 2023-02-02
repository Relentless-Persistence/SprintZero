"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import {CloseOutlined} from "@ant-design/icons"
import {Row, Col, Select, Breadcrumb, Input, Button} from "antd5"
import {useState, useEffect} from "react"
import styled from "styled-components"

import {DialogueCard, AddNote, EditNote} from "~/components/Dashboard/Dialogue"
import ResizeableDrawer from "~/components/Dashboard/ResizeableDrawer"
import {db} from "~/config/firebase-config"
import {splitRoutes} from "~/utils"
import {useActiveProductId} from "~/utils/useActiveProductId"

const Title = styled.p`
	font-size: 16px;
	line-height: 24px;
	color: #8c8c8c;
	flex: none;
	margin: 4px 0px;
`

const Versions = styled.ul`
	list-style: none;
	color: #262626;
	font-size: 16px;
`

const Version = styled.li`
	border-left-width: 4px;
	border-left-style: solid;
	border-left-color: ${(props) => (props.active ? `#315613` : `#3156131a`)};
	cursor: pointer;
	padding-bottom: 28px;
	font-style: normal;
	font-weight: 400;
	font-size: 16px;
	line-height: 24px;
	list-style: none;
`

const DEFAULT_HEIGHT = 378

const dialogueTypes = [`Identified`, `Contacted`, `Scheduled`, `Interviewed`, `Analyzing`, `Processed`]

const {Option} = Select

export default function Dialogue() {
	const userRole = `member`

	const [data, setData] = useState(null)

	const activeProductId = useActiveProductId()

	const [visible, setVisible] = useState(false)
	const [height, setHeight] = useState(DEFAULT_HEIGHT)
	const [visibleEdit, setVisibleEdit] = useState(false)
	const [activeDialogue, setActiveDialogue] = useState(dialogueTypes[0])
	const [activeDialogueIndex] = useState(0)
	const [dialogue, setDialogue] = useState(null)
	const [showAddNew, setShowAddNew] = useState(false)
	const [breadCrumb, setBreadCrumb] = useState(null)
	const [interviewee, setInterviewee] = useState(``)
	const [personas, setPersonas] = useState(null)
	const [persona, setPersona] = useState(``)

	useEffect(() => {
		if (activeDialogue) {
			setBreadCrumb(splitRoutes(`userbase/dialogues/${activeDialogue}`))
		} else {
			setBreadCrumb(splitRoutes(`userbase/dialogues`))
		}
	}, [activeDialogue])

	// Fetch data from firebase
	const fetchDialogues = async () => {
		if (activeProductId) {
			db.collection(`Dialogues`)
				.where(`product_id`, `==`, activeProductId)
				.where(`type`, `==`, activeDialogue)
				.onSnapshot((snapshot) => {
					setData(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
		}
	}

	useEffect(() => {
		fetchDialogues()
	}, [activeProductId, activeDialogue])

	useEffect(() => {
		setHeight(0.7 * window.innerHeight)
	}, [])

	const fetchPersonas = async () => {
		if (activeProductId) {
			db.collection(`Personas`)
				.where(`product_id`, `==`, activeProductId)
				.onSnapshot((snapshot) => {
					setPersonas(
						snapshot.docs.map((doc) => ({
							id: doc.id,
							...doc.data(),
						})),
					)
				})
		}
	}

	useEffect(() => {
		fetchPersonas()
	}, [activeProductId])

	const setDrawerDialogue = (item) => {
		setDialogue(item)
	}

	const openEdit = () => {
		setVisibleEdit(true)
		setVisible(false)
	}

	const editDialogue = (dialogue) => {
		const {id} = dialogue

		const newData = {...data}

		const index = newData[activeProductId][activeDialogueIndex].list.findIndex((r) => r.id === id)

		if (index > -1) {
			newData[activeProductId][activeDialogueIndex].list[index] = dialogue
			setData(newData)
		}
	}

	const addDialogue = (e) => {
		e.preventDefault()
		const data = {
			name: interviewee,
			post: persona,
			type: activeDialogue,
      notes: [],
			updatedAt: new Date().toISOString(),
			product_id: activeProductId,
		}

		if (persona !== `` && interviewee !== ``) {
			db.collection(`Dialogues`)
				.add(data)
				.then(() => {
					setInterviewee(``)
					setPersona(``)
				})
		}
	}

	const updateStage = (id, type) => {
		db.collection(`Dialogues`).doc(id).update({
			type,
			updatedAt: new Date().toISOString(),
		})
	}

	const onCancel = () => {
		setInterviewee(``)
		setPersona(``)
	}

	return (
		<div className="flex items-start justify-between">
			<div className="w-full py-[24px] px-[42px]">
				<div className="mb-4 flex items-center justify-between">
					{breadCrumb && (
						<Breadcrumb>
							{breadCrumb.map((item, i) => (
								<Breadcrumb.Item className="capitalize" key={i}>
									{item}
								</Breadcrumb.Item>
							))}
						</Breadcrumb>
					)}
				</div>

				<div>
					{data && data.length <= 0 && (
						<div className="flex h-[420px] items-center justify-center">
							<form onSubmit={addDialogue}>
								<div className="w-[320px]">
									<div className="mb-8">
										<h3 className="mb-[11px] text-[24px] font-bold">Add Interviewee</h3>
										<p className="mb-2 text-[14px] text-[#595959]">Please provide a name below</p>
										<Input
											value={interviewee}
											onChange={(e) => setInterviewee(e.target.value)}
											required
											placeholder="Name"
										/>
									</div>

									<p className="mt-8 mb-2 text-[14px] text-[#595959]">Assign a Persona</p>
									<div className="flex items-center justify-between space-x-3">
										<Select value={persona} onChange={(value) => setPersona(value)} className="w-1/3">
											{personas &&
												personas.map((persona, i) => (
													<Option key={i} value={persona.role}>
														{persona.role}
													</Option>
												))}
										</Select>
									</div>
									<div className="mt-[43px] flex justify-end space-x-2">
										<Button size="small" onClick={onCancel}>
											Cancel
										</Button>
										<Button
											className="border-[#4A801D] bg-[#4A801D] text-[14px] text-white hover:bg-[#5A9D24] hover:text-white"
											size="small"
											// onClick={onAddJourney}
											htmlType="submit"
										>
											Submit
										</Button>
									</div>
								</div>
							</form>
						</div>
					)}

					<Row className="py-6" gutter={[16, 16]}>
						{data &&
							data.map((dialogue, i) => (
								<Col xs={{span: 24}} sm={{span: 8}} key={i}>
									<DialogueCard setItem={setDrawerDialogue} openDrawer={setVisible} dialogue={dialogue} />
								</Col>
							))}
					</Row>

					{dialogue && (
						<ResizeableDrawer
							height={height}
							// forceRender={true}
							destroyOnClose
							placement="bottom"
							closable={false}
							headerStyle={{
								background: `#F5F5F5`,
							}}
							open={visible}
							onClose={() => {
                setVisible(false)
                setDialogue(null)
              }}
							title={
								<Row gutter={[16, 16]}>
									<Col span={12} className="flex items-center space-x-[12px]">
										<h3 className="text-[16px] font-semibold text-[#262626]">{dialogue.name}</h3>

										<button className="text-sm text-[#396417]" onClick={openEdit} type="button">
											Edit
										</button>
									</Col>
									<Col span={12} className="flex items-center justify-end">
										<CloseOutlined color="#A6AE9D" onClick={() => setVisible(false)} />
									</Col>
								</Row>
							}
						>
							<Row className="py-6" gutter={[20, 20]}>
								<Col span={16}>
									<p>
										<strong>Notes</strong>
									</p>

									{dialogue.notes.length > 0 ? (
										dialogue?.notes.map((note, i) => (
											<div key={i}>
												<Title>{note.title}</Title>
												<p>{note.response}</p>

												<br />
											</div>
										))
									) : (
										<p>Click Edit to add new notes</p>
									)}
								</Col>
								<Col offset={3} span={4}>
									<div className="mb-3">
										<Title className="text-right">Stage</Title>
										<Select
											defaultValue={dialogue.type}
											onChange={(value) => (userRole && userRole !== `viewer` ? updateStage(dialogue.id, value) : null)}
											className="w-full"
										>
											{dialogueTypes.map((type, i) => (
												<Option key={i} value={type}>
													{type}
												</Option>
											))}
										</Select>
									</div>

									<div className="mb-3">
										<Title className="text-right">Assigned Persona</Title>
										<p className="text-right text-lg">{dialogue?.post}</p>
									</div>

									<div className="mb-3">
										<Title className="text-right">Region</Title>
										<p className="text-right text-lg">{dialogue?.region}</p>
									</div>

									<div>
										<Title className="text-right">Education</Title>
										<p className="text-right text-lg">{dialogue?.education}</p>
									</div>
								</Col>
							</Row>
						</ResizeableDrawer>
					)}

					{dialogue && personas && (
						<EditNote
							height={height}
							visible={visibleEdit}
							dialogue={dialogue}
							setDialogue={setDialogue}
							setVisible={setVisibleEdit}
							onSubmit={editDialogue}
							activeProduct={activeProductId}
              personas={personas}
              view={setVisible}
						/>
					)}

					{showAddNew ? <AddNote visible={showAddNew} setVisible={setShowAddNew} onSubmit={addDialogue} /> : null}
				</div>
			</div>

			<div className="w-auto">
				<div>
					<Versions>
						{dialogueTypes.map((item, i) => (
							<Version
								className={`py-[16px] px-[24px]  ${activeDialogue === item ? `font-[600]` : ``}`}
								key={i}
								active={activeDialogue === item}
								onClick={() => setActiveDialogue(item)}
							>
								{item.render ? item.render() : item}
							</Version>
						))}
					</Versions>
				</div>
			</div>
		</div>
	)
}
