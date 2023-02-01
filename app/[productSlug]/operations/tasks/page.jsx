"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import {useQuery} from "@tanstack/react-query"
import {Breadcrumb, Button, notification} from "antd5"
import {useState, useEffect} from "react"
import styled from "styled-components"

import AddTask from "~/components/Tasks/AddTask"
import {Board} from "~/components/Tasks/Boards"
import CustomTag from "~/components/Tasks/CustomTag"
import EditTask from "~/components/Tasks/EditTask"
import {db} from "~/config/firebase-config"
import {splitRoutes} from "~/utils"
import {getUser} from "~/utils/api/queries"
import {useUserId} from "~/utils/atoms"
import {useActiveProductId} from "~/utils/useActiveProductId"

const boards = [`Board 0`, `Board 1`, `Board 2`, `Board 3`, `Board 4`]

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

export default function Tasks() {
	const userRole = `member`
	const activeProductId = useActiveProductId()
	const userId = useUserId()

	const {data: user} = useQuery({
		queryKey: [`user`, userId],
		queryFn: getUser(userId),
		enabled: userId !== undefined,
	})

	const [createMode, setCreateMode] = useState(false)
	const [editMode, setEditMode] = useState(false)
	const [task, setTask] = useState(null)
	const [breadCrumb, setBreadCrumb] = useState(null)
	const [data, setData] = useState(null)

	const [activeBoard, setActiveBoard] = useState(boards[0])

	useEffect(() => {
		if (activeBoard) {
			setBreadCrumb(splitRoutes(`userbase/learnings/${activeBoard}`))
		}
	}, [activeBoard])

	// Fetch data from firebase
	const fetchTasks = async () => {
		if (activeProductId) {
			db.collection(`tasks`)
				.where(`product_id`, `==`, activeProductId)
				.where(`board`, `==`, activeBoard)
				.onSnapshot((snapshot) => {
					const data = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}))
					const backlog = data.filter((item) => item.status === `Backlog`).sort((a, b) => a.order - b.order)
					const doing = data.filter((item) => item.status === `Doing`).sort((a, b) => a.order - b.order)
					const review = data.filter((item) => item.status === `Review`).sort((a, b) => a.order - b.order)
					const done = data.filter((item) => item.status === `Done`).sort((a, b) => a.order - b.order)

					setData([
						{
							columnId: `0`,
							columnName: `Backlog`,
							data: backlog,
						},
						{
							columnId: `1`,
							columnName: `Doing`,
							data: doing,
						},
						{
							columnId: `2`,
							columnName: `Review`,
							data: review,
						},
						{
							columnId: `3`,
							columnName: `Done`,
							data: done,
						},
					])

					// if(data.length < 1) {
					//   setCreateMode(true)
					// }
				})
		}
	}

	useEffect(() => {
		fetchTasks()
	}, [activeProductId, activeBoard])

	const handleDrop = async (card, targetColId) => {
		const selectedTask = data[card.colId].data[card.id]
		const targetTask = data[targetColId]

		await db
			.collection(`tasks`)
			.doc(selectedTask.id)
			.update({
				status: targetTask.columnName,
				order: targetTask.data.length <= 0 ? 0 : targetTask.data.length === 1 ? 1 : targetTask.data.length - 1,
			})
			.then(() => {
				notification.success({message: `Task updated successfully`})
			})
			.catch(() => {
				notification.error({message: `An error occurred!`})
			})
	}

	// const handleSwap = (currentCard, targetCard) => {
	// 	const info = {...data}

	// 	const selectedTask = data[currentCard.colId].data[currentCard.id]
	// 	const selectedTaskOrder = data[currentCard.colId].data[currentCard.id].order
	// 	const targetTask = data[targetCard.colId].data[currentCard.id]
	// 	const targetTaskOrder = data[targetCard.colId].data[currentCard.id].order

	// }

	const renderCol = (card) => {
		return (
			<div style={{width: `100%`}} onClick={() => selectTask(card)}>
				<CustomTag shortTitle={card.title} due_date={card.date} />
			</div>
		)
	}

	const selectTask = (task) => {
		if (userRole && userRole !== `viewer`) {
			setTask(task)
			setEditMode(true)
		}
	}

	return (
		<div className="flex items-start justify-between">
			<div className="w-full overflow-x-auto">
				<div className="px-[42px] pt-[24px]">
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
							<Button className="bg-white hover:border-none hover:text-black" onClick={() => setCreateMode(true)}>
								Add New
							</Button>
						</div>
					</div>
				</div>

				<div className="pl-[42px]">
					<div>
						<div
							style={{
								width: `1200px`,
								paddingBottom: `5px`,
								paddingRight: `100px`,
							}}
						>
							{data && (
								<Board
									colCount={data.length}
									onDrop={handleDrop}
									// onSwap={handleSwap}
									columns={data}
									renderColumn={renderCol}
									columnHeaderRenders={[null, null, null]}
								/>
							)}
						</div>
					</div>

					{task && user && (
						<EditTask editMode={editMode} setEditMode={setEditMode} task={task} setTask={setTask} user={user} />
					)}

					{data && (
						<AddTask
							createMode={createMode}
							setCreateMode={setCreateMode}
							product={activeProductId}
							order={data[0].data.length}
							board={activeBoard}
						/>
					)}
				</div>
			</div>

			<div className="w-[112px]">
				<div className="">
					<Versions>
						{boards.map((item, i) => (
							<Version
								className={`py-[16px] px-[24px] text-sm  ${activeBoard === item ? `font-[600]` : ``}`}
								key={i}
								active={activeBoard === item}
								onClick={() => setActiveBoard(item)}
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
