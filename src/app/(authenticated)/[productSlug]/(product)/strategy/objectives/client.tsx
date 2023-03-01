"use client"

import {AimOutlined, PlusOutlined} from "@ant-design/icons"
import {Breadcrumb, Empty, FloatButton, Input, Tabs} from "antd"
import {collection, doc, orderBy, query, updateDoc, where} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"
import {useDebounce} from "react-use"

import type {FC} from "react"
import type {Id} from "~/types"

import ResultCard from "./ResultCard"
import {ObjectiveConverter} from "~/types/db/Objectives"
import {ResultConverter} from "~/types/db/Results"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const ObjectivesClientPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [currentObjectiveId, setCurrentObjectiveId] = useState<Id | undefined>(undefined)

	const [objectives] = useCollection(
		query(
			collection(db, `Objectives`),
			where(`productId`, `==`, activeProductId),
			orderBy(`name`, `asc`),
		).withConverter(ObjectiveConverter),
	)

	const hasSetInitialObjective = useRef(false)
	useEffect(() => {
		if (hasSetInitialObjective.current || !objectives) return
		if (objectives.docs.length > 0) setCurrentObjectiveId(objectives.docs[0]!.id as Id)
		hasSetInitialObjective.current = true
	}, [objectives])

	const currentObjective = objectives?.docs.find((doc) => doc.id === currentObjectiveId)

	const [results] = useCollection(
		currentObjectiveId
			? query(collection(db, `Objectives`, currentObjectiveId, `Results`), orderBy(`createdAt`, `asc`)).withConverter(
					ResultConverter,
			  )
			: undefined,
	)

	const hasSetDefaultObjective = useRef(false)
	useEffect(() => {
		if (hasSetDefaultObjective.current || !objectives) return
		if (objectives.docs.length > 0) setCurrentObjectiveId(objectives.docs[0]!.id as Id)
		hasSetDefaultObjective.current = true
	}, [objectives])

	const [statement, setStatement] = useState(``)
	const dbStatement = currentObjective?.data().statement
	useEffect(() => {
		if (!dbStatement) return
		setStatement(dbStatement)
	}, [dbStatement])
	useDebounce(
		async () => {
			if (!currentObjective || statement === dbStatement) return
			await updateDoc(doc(db, `Objectives`, currentObjective.id).withConverter(ObjectiveConverter), {
				statement,
			})
		},
		500,
		[statement, dbStatement, currentObjective],
	)

	const [activeResultId, setActiveResultId] = useState<string | `new` | undefined>(undefined)

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="relative flex w-full flex-col gap-6 overflow-auto px-12 py-8">
				<Breadcrumb>
					<Breadcrumb.Item>Strategy</Breadcrumb.Item>
					<Breadcrumb.Item>Objectives</Breadcrumb.Item>
					<Breadcrumb.Item>{currentObjective?.data().name}</Breadcrumb.Item>
				</Breadcrumb>

				{currentObjectiveId && (
					<Input
						addonBefore={<AimOutlined />}
						placeholder="Objective"
						value={statement}
						onChange={(e) => {
							if (!currentObjective) return
							setStatement(e.target.value)
						}}
					/>
				)}

				{currentObjectiveId && (
					<Masonry
						breakpointCols={{default: 4, 1700: 3, 1300: 2, 1000: 1}}
						className="flex gap-8"
						columnClassName="flex flex-col gap-8"
					>
						{results?.docs.map(
							(result, index) =>
								currentObjective?.exists() && (
									<ResultCard
										key={result.id}
										objectiveId={currentObjective.id as Id}
										result={result}
										index={index}
										isEditing={result.id === activeResultId}
										onEditStart={() => setActiveResultId(result.id)}
										onEditEnd={() => setActiveResultId(undefined)}
									/>
								),
						)}

						{activeResultId === `new` && currentObjective && (
							<ResultCard
								isEditing
								objectiveId={currentObjective.id as Id}
								onEditStart={() => setActiveResultId(`new`)}
								onEditEnd={() => setActiveResultId(undefined)}
							/>
						)}
					</Masonry>
				)}

				{results?.docs.length === 0 && activeResultId === undefined && (
					<div className="grid grow place-items-center">
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					</div>
				)}

				<FloatButton
					icon={<PlusOutlined className="text-primary" />}
					onClick={() => setActiveResultId(`new`)}
					className="absolute right-12 bottom-8"
				/>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentObjectiveId}
				onChange={(key: Id) => {
					setCurrentObjectiveId(key)
					setStatement(objectives?.docs.find((objective) => objective.id === key)?.data().statement || ``)
				}}
				items={objectives?.docs.map((objective) => ({key: objective.id, label: objective.data().name}))}
			/>
		</div>
	)
}

export default ObjectivesClientPage