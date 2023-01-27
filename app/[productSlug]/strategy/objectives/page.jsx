"use client"

/* eslint-disable react-hooks/exhaustive-deps */

import {AimOutlined} from "@ant-design/icons"
import {Input, message, Breadcrumb, Button} from "antd5"
import {findIndex} from "lodash"
import {useState, useEffect} from "react"
import styled from "styled-components"

import {ObjectiveFormCard} from "~/components/Dashboard/FormCard"
import {ObjectiveItemCard} from "~/components/Dashboard/ItemCard"
import MasonryGrid from "~/components/Dashboard/MasonryGrid"
import {db} from "~/config/firebase-config"
import {splitRoutes} from "~/utils"
import {useActiveProductId} from "~/utils/useActiveProductId"

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
`

const AddSide = styled(Button)`
	background: transparent !important ;
	border: none;
	color: #262626 !important ;
	box-shadow: none;
	font-size: 16px;
	line-height: 24px;
	margin: 0;
	padding: 0;
	text-align: start;
	font-weight: 600;
`

export default function Objectives() {
	const activeProductId = useActiveProductId()

	const [data, setData] = useState(null)
	const [goalNames, setGoalNames] = useState([])
	const [showAdd, setShowAdd] = useState(false)

	const [activeGoal, setActiveGoal] = useState(null)
	const [activeGoalIndex, setActiveGoalIndex] = useState(0)
	const [results, setResults] = useState(null)
	const [breadCrumb, setBreadCrumb] = useState(null)
	const [showSideAdd, setShowSideAdd] = useState(false)
	const [sideAddValue, setSideAddValue] = useState(``)

	useEffect(() => {
		if (activeGoal) {
			setBreadCrumb(splitRoutes(`strategy/accessibility/${activeGoal}`))
		}
	}, [activeGoal])

	const fetchGoals = async () => {
		if (activeProductId) {
			db.collection(`Goals`)
				.where(`product_id`, `==`, activeProductId)
				.onSnapshot((snapshot) => {
					if (snapshot.empty) {
						db.collection(`Goals`).add({
							product_id: activeProductId,
							description: ``,
							name: `001`,
						})
					} else {
						setData(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
					}
				})
		}
	}

	useEffect(() => {
		fetchGoals()
	}, [activeProductId])

	const getGoalNames = () => {
		if (data) {
			let goalNames = []
			data.map((g) => goalNames.push(g.name))
			setGoalNames(goalNames.sort())
			setActiveGoal(goalNames[0])
		}
	}

	useEffect(() => {
		getGoalNames()
	}, [data])

	const fetchResults = async () => {
		if (data) {
			db.collection(`Result`)
				.where(`goal_id`, `==`, data[activeGoalIndex].id)
				.onSnapshot((snapshot) => {
					setResults(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
		}
	}

	useEffect(() => {
		fetchResults()
	}, [data, activeGoalIndex])

	const handleTitleChange = async (e) => {
		const {value} = e.target
		await db.collection(`Goals`).doc(data[activeGoalIndex].id).update({
			description: value,
		})
		// .then(() => message.success("Goal updated successfully"));
	}

	const onClose = () => {
		setShowSideAdd(false)
		setSideAddValue(``)
	}

	const setGoal = (goalName) => {
		const goal = findIndex(goalNames, (o) => o === goalName)
		setActiveGoalIndex(goal)
		setActiveGoal(goalNames[goal])
	}

	// const onAddGoal = () => {
	// 	const newData = {...data}
	// 	const length = newData[activeProduct]?.length || 0
	// 	const goal = {
	// 		name: String(length + 1).padStart(3, "0"),
	// 		title: String(length + 1).padStart(3, "0"),
	// 		results: [],
	// 	}
	// 	newData[activeProduct].push(goal)

	// 	setData(newData)
	// }

	const addItem = () => {
		setShowAdd(true)
	}

	const cancelAdd = () => {
		setShowAdd(false)
	}

	const onEnter = (e) => {
		if (e.key === `Enter`) {
			db.collection(`Goals`)
				.add({
					product_id: activeProductId,
					description: ``,
					name: sideAddValue,
				})
				.then(() => {
					setShowSideAdd(false)
					setSideAddValue(``)
				})
		}
	}

	const addItemDone = (item) => {
		const id = data[activeGoalIndex].id
		if (id) {
			// eslint-disable-next-line no-negated-condition
			if (item.description !== `` && item.name !== ``) {
				const data = {
					goal_id: id,
					name: item.name,
					description: item.description,
				}
				db.collection(`Result`)
					.add(data)
					.then(() => {
						message.success(`New result added successfully`)
					})
					.catch(() => {
						message.error(`Error adding result`)
					})

				setShowAdd(false)
			} else {
				message.error(`Please fill all the fields`)
			}
		}
	}

	const editItem = async (id, item) => {
		if (id && item.description !== `` && item.name !== ``) {
			await db
				.collection(`Result`)
				.doc(id)
				.update({
					name: item.name,
					description: item.description,
				})
				.then(() => {
					message.success(`Result updated successfully`)
				})
		} else {
			message.error(`Please fill all fields`)
		}
	}

	const deleteItem = (id) => {
		db.collection(`Result`)
			.doc(id)
			.delete()
			.then(() => {
				message.success(`Item removed successfully`)
			})
	}

	return (
		<div className="flex items-start justify-between">
			<div className="w-full">
				<div className="py-[24px] px-[42px]">
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

						<div>
							<Button className="bg-white hover:border-none hover:text-black" onClick={addItem}>
								Add New
							</Button>
						</div>
					</div>

					<div>
						{data && (
							<Input
								prefix={<AimOutlined />}
								maxLength={80}
								className="mb-[16px]"
								onChange={handleTitleChange}
								value={data[activeGoalIndex]?.description}
							/>
						)}

						{results && results.length > 0 ? (
							<MasonryGrid>
								{results.map((result, i) => (
									<ObjectiveItemCard
										key={i}
										onEdit={(item) => editItem(result.id, item)}
										item={result}
										index={i + 1}
										onDelete={() => deleteItem(result.id)}
									/>
								))}
								{showAdd ? <ObjectiveFormCard onSubmit={addItemDone} onCancel={cancelAdd} /> : null}
							</MasonryGrid>
						) : (
							<MasonryGrid>
								<ObjectiveFormCard onSubmit={addItemDone} onCancel={cancelAdd} />
							</MasonryGrid>
						)}
					</div>
				</div>
			</div>

			<div className="w-auto">
				<div>
					<Versions>
						{goalNames.map((item, i) => (
							<Version
								className={`py-[16px] px-[24px]  ${activeGoal === item ? `font-[600]` : ``}`}
								key={i}
								active={activeGoal === item}
								onClick={() => setGoal(item)}
							>
								{item.render ? item.render() : item}
							</Version>
						))}

						{showSideAdd && (
							<Version className="py-[16px] px-[24px]">
								<Input
									className="mx-0 my-0"
									maxLength={15}
									autoFocus
									value={sideAddValue}
									onChange={(e) => setSideAddValue(e.target.value)}
									onKeyPress={onEnter}
									style={{maxWidth: `90px`}}
								/>
							</Version>
						)}

						{showSideAdd === false && (
							<Version className="py-[16px] px-[24px]">
								<AddSide onClick={() => setShowSideAdd(true)}>Add</AddSide>
							</Version>
						)}

						{showSideAdd && (
							<Version className="py-[16px] px-[24px]">
								<AddSide onClick={onClose}>Close</AddSide>
							</Version>
						)}
					</Versions>
				</div>
			</div>
		</div>
	)
}
