"use client"

import {AimOutlined, PlusOutlined} from "@ant-design/icons"
import {Breadcrumb, Empty, FloatButton, Input, Tabs} from "antd"
import {collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"

import ObjectiveCard from "./ObjectiveCard"
import {ObjectiveConverter} from "~/types/db/Objectives"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const ObjectivesPage: FC = () => {
	const activeProductId = useActiveProductId()

	const [objectives] = useCollection(
		query(collection(db, `Objectives`), where(`productId`, `==`, activeProductId)).withConverter(ObjectiveConverter),
	)

	const [currentObjectiveId, setCurrentObjectiveId] = useState<Id | `empty`>(`empty`)
	const currentObjective = objectives?.docs.find((objective) => objective.id === currentObjectiveId)

	const hasSetDefaultObjective = useRef(false)
	useEffect(() => {
		if (hasSetDefaultObjective.current || !objectives) return
		if (objectives.docs.length > 0) setCurrentObjectiveId(objectives.docs[0]!.id as Id)
		hasSetDefaultObjective.current = true
	}, [objectives])

	const [statement, setStatement] = useState(``)
	const [activeResultId, setActiveResultId] = useState<string | `new` | undefined>(undefined)

	useEffect(() => {
		if (!currentObjective) return
		setStatement(currentObjective.data().statement)
	}, [currentObjective])

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="relative flex w-full flex-col gap-6 overflow-auto px-12 py-8">
				<Breadcrumb>
					<Breadcrumb.Item>Strategy</Breadcrumb.Item>
					<Breadcrumb.Item>Objectives</Breadcrumb.Item>
					<Breadcrumb.Item>{currentObjective?.data().name}</Breadcrumb.Item>
				</Breadcrumb>

				{currentObjective && (
					<Input
						addonBefore={<AimOutlined />}
						placeholder="Objective"
						value={statement}
						onChange={(e) => {
							setStatement(e.target.value)
							updateDoc(doc(db, `Objectives`, currentObjective.id).withConverter(ObjectiveConverter), {
								statement,
							}).catch(console.error)
						}}
					/>
				)}

				{currentObjective && (
					<Masonry
						breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
						className="flex gap-8"
						columnClassName="bg-clip-padding flex flex-col gap-8"
					>
						{currentObjective.data().results.map((result) => (
							<ObjectiveCard
								key={result.id}
								objective={currentObjective}
								resultId={result.id}
								isEditing={result.id === activeResultId}
								onEditStart={() => setActiveResultId(result.id)}
								onEditEnd={() => setActiveResultId(undefined)}
							/>
						))}

						{activeResultId === `new` && (
							<ObjectiveCard
								objective={currentObjective}
								isEditing
								onEditStart={() => setActiveResultId(`new`)}
								onEditEnd={() => setActiveResultId(undefined)}
							/>
						)}
					</Masonry>
				)}

				{currentObjective?.data().results.length === 0 && activeResultId === undefined && (
					<div className="grid grow place-items-center">
						<div
							style={{
								boxShadow: `0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)`,
							}}
							className="rounded-md bg-white px-20 py-4"
						>
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
						</div>
					</div>
				)}

				<FloatButton
					shape="square"
					icon={<PlusOutlined className="text-green" />}
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

export default ObjectivesPage
