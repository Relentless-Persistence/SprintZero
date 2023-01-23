"use client"

/* eslint-disable react-hooks/exhaustive-deps */

import {AimOutlined} from "@ant-design/icons"
import {Input, message} from "antd"
import {findIndex} from "lodash"
import {useState, useEffect} from "react"

import {ObjectiveFormCard} from "~/components/Dashboard/FormCard"
import ItemCard, {ObjectiveItemCard} from "~/components/Dashboard/ItemCard"
import MasonryGrid from "~/components/Dashboard/MasonryGrid"
import {db} from "~/config/firebase-config"
import {splitRoutes} from "~/utils"
import {useActiveProductId} from "~/utils/useActiveProductId"




export default function Objectives() {
	const activeProductId = useActiveProductId()

	const [data, setData] = useState(null)
	const [goalNames, setGoalNames] = useState([])
	const [showAdd, setShowAdd] = useState(false)

	const [activeGoal, setActiveGoal] = useState(null)
	const [activeGoalIndex, setActiveGoalIndex] = useState(0)
	const [results, setResults] = useState(null)

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

	// const onClose = () => {
	// 	setVisible(false)
	// }

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

	const addItemDone = (item) => {
		const id = data[activeGoalIndex].id
		if (id) {
			if (item.description !== ``) {
				const data = {
					goal_id: id,
					description: item.description,
				}
				db.collection(`Result`)
					.add(data)
					.then((docRef) => {
						message.success(`New result added successfully`)
					})
					.catch((error) => {
						message.error(`Error adding result`)
					})

				setShowAdd(false)
			} else {
				message.error(`Please fill all the fields`)
			}
		}
	}

	const editItem = async (id, item) => {
		if (id && item.description !== ``) {
			await db
				.collection(`Result`)
				.doc(id)
				.update({
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
		<div className="mb-8">

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
	)
}
