"use client"

import {AimOutlined} from "@ant-design/icons"
import {Input, Breadcrumb, Button, Empty, Tabs} from "antd"
import {addDoc, collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Objective} from "~/types/db/Objectives"

import ObjectiveCard from "./ObjectiveCard"
import {ObjectiveConverter, Objectives} from "~/types/db/Objectives"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const ObjectivesPage: FC = () => {
	const activeProductId = useActiveProductId()

	const [objectives] = useCollectionData(
		query(collection(db, Objectives._), where(Objectives.productId, `==`, activeProductId)).withConverter(
			ObjectiveConverter,
		),
	)

	const [currentObjectiveId, setCurrentObjectiveId] = useState<Id | `empty`>(`empty`)
	const currentObjective = objectives?.find((objective) => objective.id === currentObjectiveId)

	const hasSetDefaultObjective = useRef(false)
	useEffect(() => {
		if (hasSetDefaultObjective.current || !objectives) return
		if (objectives.length > 0) setCurrentObjectiveId(objectives[0]!.id)
		hasSetDefaultObjective.current = true
	}, [objectives])

	const [statement, setStatement] = useState(``)
	const [activeResultId, setActiveResultId] = useState<string | `new` | undefined>(undefined)

	useEffect(() => {
		if (!currentObjective) return
		setStatement(currentObjective.statement)
	}, [currentObjective])

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex w-full flex-col gap-6 overflow-auto px-12 py-8">
				<div className="flex items-center justify-between">
					<Breadcrumb>
						<Breadcrumb.Item>Strategy</Breadcrumb.Item>
						<Breadcrumb.Item>Objectives</Breadcrumb.Item>
						<Breadcrumb.Item>{currentObjective?.name}</Breadcrumb.Item>
					</Breadcrumb>

					<Button className="bg-white" onClick={() => setActiveResultId(`new`)}>
						Add New
					</Button>
				</div>

				{currentObjective && (
					<Input
						addonBefore={<AimOutlined />}
						value={statement}
						onChange={async (e) => {
							setStatement(e.target.value)
							await updateDoc(doc(db, Objectives._, currentObjective.id), {
								statement,
							} satisfies Partial<Objective>)
						}}
					/>
				)}

				{currentObjective && (
					<Masonry
						breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
						className="flex gap-8"
						columnClassName="bg-clip-padding flex flex-col gap-8"
					>
						{currentObjective.results.map((result) => (
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

				{currentObjective?.results.length === 0 && activeResultId === undefined && (
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
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentObjectiveId}
				onChange={async (key: Id | `new`) => {
					if (key === `new`) {
						const ref = await addDoc(collection(db, Objectives._), {
							name: String(objectives!.length + 1).padStart(3, `0`),
							results: [],
							statement: ``,
							productId: activeProductId,
						} satisfies Objective)
						setCurrentObjectiveId(ref.id as Id)
					} else {
						setCurrentObjectiveId(key)
						setStatement(objectives?.find((objective) => objective.id === key)?.statement || ``)
					}
				}}
				items={[
					...(objectives?.map((objective) => ({key: objective.id, label: objective.name})) ?? [
						{key: `empty`, label: ``},
					]),
					{key: `new`, label: `Add`},
				]}
			/>
		</div>
	)
}

export default ObjectivesPage
