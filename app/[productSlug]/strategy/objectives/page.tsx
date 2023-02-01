"use client"

import {AimOutlined} from "@ant-design/icons"
import {Input, Breadcrumb, Button, Card, Empty} from "antd5"
import {collection, onSnapshot, query, where} from "firebase9/firestore"
import produce from "immer"
import {nanoid} from "nanoid"
import {useState, useEffect} from "react"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Objective} from "~/types/db/Objectives"

import {db} from "~/utils/firebase"
import {Objectives, ObjectiveSchema} from "~/types/db/Objectives"
import {updateObjective} from "~/utils/api/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const ObjectivesPage: FC = () => {
	const activeProductId = useActiveProductId()

	const [objectives, setObjectives] = useState<Objective[]>([])
	useEffect(
		() =>
			onSnapshot(query(collection(db, Objectives._), where(Objectives.productId, `==`, activeProductId)), (docs) => {
				const data: Objective[] = []
				docs.forEach((doc) => {
					const _data = ObjectiveSchema.parse({...doc.data(), id: doc.id})
					data.push(_data)
				})
				setObjectives(data)
			}),
		[activeProductId],
	)

	const [resultDraft, setResultDraft] = useState<{name: string; text: string} | undefined>(undefined)
	const [currentObjectiveId, setCurrentObjectiveId] = useState<Id | undefined>(undefined)
	const currentObjective = objectives.find((objective) => objective.id === currentObjectiveId)
	const [title, setTitle] = useState(``)
	const [activeResultId, setActiveResultId] = useState<string | undefined>(undefined)

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex w-full flex-col gap-6 px-12 py-8">
				<div className="flex items-center justify-between">
					<div className="mb-4 flex items-center justify-between">
						<Breadcrumb>
							<Breadcrumb.Item>Strategy</Breadcrumb.Item>
							<Breadcrumb.Item>Objectives</Breadcrumb.Item>
							<Breadcrumb.Item>{currentObjective?.name}</Breadcrumb.Item>
						</Breadcrumb>

						<Button className="bg-white" onClick={() => void setResultDraft({name: ``, text: ``})}>
							Add New
						</Button>
					</div>

					{currentObjective && (
						<Input
							addonBefore={<AimOutlined />}
							value={title}
							onChange={(e) => {
								setTitle(e.target.value)
								updateObjective({
									id: currentObjective.id,
									data: {title},
								})
							}}
						/>
					)}

					{currentObjective && currentObjective.results.length > 0 && (
						<Masonry
							breakpointCols={3}
							className="grid grid-cols-3 gap-8"
							columnClassName="bg-clip-padding space-y-8 !w-full"
						>
							{currentObjective.results.map((result) => (
								<Card
									key={result.id}
									type="inner"
									title={
										result.id === activeResultId && resultDraft ? (
											<Input
												size="small"
												value={resultDraft.name}
												onChange={(e) => void setResultDraft((item) => ({name: e.target.value, text: item!.text}))}
												className="mr-4"
											/>
										) : (
											<p>{result.name}</p>
										)
									}
									extra={
										result.id === activeResultId && resultDraft ? (
											<div className="ml-4 flex gap-2">
												<Button
													size="small"
													onClick={() => {
														setActiveResultId(undefined)
														setResultDraft(undefined)
													}}
												>
													Cancel
												</Button>
												<Button
													size="small"
													type="primary"
													className="bg-green-s500"
													onClick={() => {
														const newObjective = produce(currentObjective, (draft) => {
															const index = draft.results.findIndex((item) => item.id === result.id)
															draft.results[index]!.name = resultDraft.name
															draft.results[index]!.text = resultDraft.text
														})
														updateObjective({
															id: currentObjective.id,
															data: newObjective,
														})
														setActiveResultId(undefined)
														setResultDraft(undefined)
													}}
												>
													Done
												</Button>
											</div>
										) : (
											<button
												type="button"
												onClick={() => {
													setResultDraft({name: result.name, text: result.text})
													setActiveResultId(result.id)
												}}
											>
												Edit
											</button>
										)
									}
								>
									{result.id === activeResultId && resultDraft ? (
										<div className="flex flex-col items-stretch gap-2">
											<div className="relative h-max">
												<p className="invisible min-w-0 break-words border p-1">{resultDraft.text || `filler`}</p>
												<Input.TextArea
													value={resultDraft.text}
													onChange={(e) =>
														void setResultDraft((result) => ({name: result!.name, text: e.target.value}))
													}
													className="absolute inset-0"
												/>
											</div>
											<Button
												danger
												onClick={() =>
													void updateObjective({
														id: currentObjective.id,
														data: {
															...currentObjective,
															results: currentObjective.results.filter(({id}) => result.id === id),
														},
													})
												}
											>
												Remove
											</Button>
										</div>
									) : (
										<p className="min-w-0 break-all">{result.text}</p>
									)}
								</Card>
							))}

							{resultDraft && !activeResultId && (
								<Card
									type="inner"
									title={
										<Input
											size="small"
											value={resultDraft.name}
											onChange={(e) => void setResultDraft((result) => ({name: e.target.value, text: result!.text}))}
										/>
									}
									extra={
										<div className="ml-4 flex gap-2">
											<Button
												size="small"
												onClick={() => {
													setActiveResultId(undefined)
													setResultDraft(undefined)
												}}
											>
												Cancel
											</Button>
											<Button
												size="small"
												type="primary"
												className="bg-green-s500"
												onClick={() => {
													updateObjective({
														id: currentObjective.id,
														data: {
															...currentObjective,
															results: [
																...currentObjective.results,
																{
																	id: nanoid(),
																	name: resultDraft.name,
																	text: resultDraft.text,
																},
															],
														},
													})
													setActiveResultId(undefined)
													setResultDraft(undefined)
												}}
											>
												Done
											</Button>
										</div>
									}
								>
									<div className="relative h-max">
										<p className="invisible break-all border p-1">{resultDraft.text || `filler`}</p>
										<Input.TextArea
											value={resultDraft.text}
											onChange={(e) => void setResultDraft((result) => ({name: result!.name, text: e.target.value}))}
											className="absolute inset-0"
										/>
									</div>
								</Card>
							)}
						</Masonry>
					)}

					{currentObjective?.results.length === 0 && !resultDraft && (
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
			</div>
		</div>
	)
}

export default ObjectivesPage
