"use client"

import { AimOutlined, PlusOutlined } from "@ant-design/icons"
import { Breadcrumb, Empty, FloatButton, Input, Tabs } from "antd"
import { collection, doc, orderBy, query, updateDoc } from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"
import { useDebounce } from "react-use"

import type { FC } from "react"

import ResultCard from "./ResultCard"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { ObjectiveConverter } from "~/types/db/Products/Objectives"
import { ResultConverter } from "~/types/db/Products/Objectives/Results"

const ObjectivesClientPage: FC = () => {
	const { product } = useAppContext()
	const [currentObjectiveId, setCurrentObjectiveId] = useState<string | undefined>(undefined)

	const [objectives, , objectivesError] = useCollection(
		query(collection(product.ref, `Objectives`), orderBy(`name`, `asc`)).withConverter(ObjectiveConverter),
	)
	useErrorHandler(objectivesError)

	const hasSetInitialObjective = useRef(false)
	useEffect(() => {
		if (hasSetInitialObjective.current || !objectives) return
		if (objectives.docs.length > 0) setCurrentObjectiveId(objectives.docs[0]!.id)
		hasSetInitialObjective.current = true
	}, [objectives])

	const currentObjective = objectives?.docs.find((doc) => doc.id === currentObjectiveId)

	const [results, , resultsError] = useCollection(
		currentObjectiveId
			? query(
				collection(product.ref, `Objectives`, currentObjectiveId, `Results`),
				orderBy(`createdAt`, `asc`),
			).withConverter(ResultConverter)
			: undefined,
	)
	useErrorHandler(resultsError)

	const hasSetDefaultObjective = useRef(false)
	useEffect(() => {
		if (hasSetDefaultObjective.current || !objectives) return
		if (objectives.docs.length > 0) setCurrentObjectiveId(objectives.docs[0]!.id)
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
			await updateDoc(doc(product.ref, `Objectives`, currentObjective.id).withConverter(ObjectiveConverter), {
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
				<Breadcrumb items={[{ title: `Strategy` }, { title: `Objectives` }, { title: currentObjective?.data().name }]} />
				<div className="leading-normal">
					<h1 className="text-4xl font-semibold">Objectives + key results</h1>
					<p className="text-base text-textSecondary">
						Define the measurable outcomes that will define success
					</p>
				</div>
				<Tabs
					tabPosition="top"
					activeKey={currentObjectiveId}
					onChange={(key) => {
						setCurrentObjectiveId(key)
						setStatement(objectives?.docs.find((objective) => objective.id === key)?.data().statement || ``)
					}}
					items={objectives?.docs.map((objective) => ({ key: objective.id, label: objective.data().name }))}
				/>
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
						breakpointCols={{ default: 4, 1700: 3, 1300: 2, 1000: 1 }}
						className="flex gap-8"
						columnClassName="flex flex-col gap-8"
					>
						{results?.docs.map(
							(result, index) =>
								currentObjective?.exists() && (
									<ResultCard
										key={result.id}
										objectiveId={currentObjective.id}
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
								index={results?.docs.length}
								isEditing
								objectiveId={currentObjective.id}
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
					tooltip="Add Result"
					onClick={() => setActiveResultId(`new`)}
					className="absolute right-12 bottom-8"
				/>
			</div>
		</div>
	)
}

export default ObjectivesClientPage
