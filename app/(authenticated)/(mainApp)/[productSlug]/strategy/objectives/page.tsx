"use client"

import {AimOutlined} from "@ant-design/icons"
import {Input, Breadcrumb, Button, Empty, Tabs} from "antd"
import {addDoc, collection, query, where} from "firebase/firestore"
import produce from "immer"
import {debounce} from "lodash"
import {nanoid} from "nanoid"
import {useEffect, useRef, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Objective} from "~/types/db/Objectives"

import EditableTextAreaCard from "~/components/EditableTextAreaCard"
import {ObjectiveConverter, Objectives} from "~/types/db/Objectives"
import {db} from "~/utils/firebase"
import {updateObjective} from "~/utils/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const debouncedUpdateObjective = debounce(updateObjective, 300)

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
			<div className="flex w-full flex-col gap-6 px-12 py-8">
				<div className="flex items-center justify-between">
					<Breadcrumb>
						<Breadcrumb.Item>Strategy</Breadcrumb.Item>
						<Breadcrumb.Item>Objectives</Breadcrumb.Item>
						<Breadcrumb.Item>{currentObjective?.name}</Breadcrumb.Item>
					</Breadcrumb>

					<Button className="bg-white" onClick={() => void setActiveResultId(`new`)}>
						Add New
					</Button>
				</div>

				{currentObjective && (
					<Input
						addonBefore={<AimOutlined />}
						value={statement}
						onChange={(e) => {
							setStatement(e.target.value)
							debouncedUpdateObjective({
								id: currentObjective.id,
								data: {statement},
							})
						}}
					/>
				)}

				{currentObjective && (
					<Masonry
						breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
						className="flex gap-8"
						columnClassName="bg-clip-padding space-y-8"
					>
						{currentObjective.results.map((result) => (
							<EditableTextAreaCard
								key={result.id}
								isEditing={result.id === activeResultId}
								onEditStart={() => void setActiveResultId(result.id)}
								title={result.name}
								text={result.text}
								onCancel={() => void setActiveResultId(undefined)}
								onCommit={(title, text) => {
									const newObjective = produce(currentObjective, (draft) => {
										const index = draft.results.findIndex((item) => item.id === result.id)
										draft.results[index]!.name = title
										draft.results[index]!.text = text
									})
									updateObjective({
										id: currentObjective.id,
										data: newObjective,
									})
									setActiveResultId(undefined)
								}}
								onDelete={() =>
									void updateObjective({
										id: currentObjective.id,
										data: {
											...currentObjective,
											results: currentObjective.results.filter(({id}) => result.id === id),
										},
									})
								}
							/>
						))}

						{activeResultId === `new` && (
							<EditableTextAreaCard
								isEditing
								title=""
								text=""
								onCancel={() => void setActiveResultId(undefined)}
								onCommit={(title, text) => {
									updateObjective({
										id: currentObjective.id,
										data: {
											...currentObjective,
											results: [
												...currentObjective.results,
												{
													id: nanoid(),
													name: title,
													text,
												},
											],
										},
									})
									setActiveResultId(undefined)
								}}
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
