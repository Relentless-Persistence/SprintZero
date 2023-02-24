"use client"

import {
	AuditOutlined,
	CodeSandboxOutlined,
	EyeOutlined,
	FileSearchOutlined,
	OrderedListOutlined,
} from "@ant-design/icons"
import {Breadcrumb, Select, Switch, Tabs, Tag} from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {collection, doc, orderBy, query, where} from "firebase/firestore"
import {useMemo, useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {Dayjs} from "dayjs"
import type {FC} from "react"
import type {Id} from "~/types"

import SprintColumn from "./SprintColumn"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter, sprintColumns} from "~/types/db/StoryMapStates"
import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

dayjs.extend(relativeTime)

const SprintClientPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
	const [storyMapStates] = useCollection(
		query(collection(db, `StoryMapStates`), where(`productId`, `==`, activeProductId)).withConverter(
			StoryMapStateConverter,
		),
	)
	const storyMapState = storyMapStates?.docs[0]
	const [myStoriesOnly, setMyStoriesOnly] = useState(false)

	const firstSprintStartDate = activeProduct?.exists()
		? findPreviousOccurenceOfDayOfWeek(
				dayjs(activeProduct.data().createdAt.toMillis()),
				activeProduct.data().sprintStartDayOfWeek,
		  )
		: undefined
	const sprints = useMemo(() => {
		if (!activeProduct?.exists()) return []
		const sprints: Array<{startDate: string; endDate: string}> = []
		let dateCursor = firstSprintStartDate
		while (dateCursor && dateCursor.isBefore(dayjs())) {
			const sprintStartDate = dateCursor.format(`YYYY-MM-DD`)
			dateCursor = dateCursor.add(activeProduct.data().cadence - 1, `week`)
			dateCursor = dateCursor.add(6, `day`)
			const sprintEndDate = dateCursor.format(`YYYY-MM-DD`)
			sprints.push({startDate: sprintStartDate, endDate: sprintEndDate})
			dateCursor = dateCursor.add(1, `day`)
		}
		return sprints
	}, [activeProduct, firstSprintStartDate])
	const currentSprintEndDate = dayjs(sprints.at(-1)?.endDate)

	const [versions] = useCollection(
		storyMapState
			? query(collection(db, `StoryMapStates`, storyMapState.id, `Versions`), orderBy(`name`, `asc`)).withConverter(
					VersionConverter,
			  )
			: undefined,
	)

	const [currentVersionId, setCurrentVersionId] = useState<Id | `__ALL_VERSIONS__`>(`__ALL_VERSIONS__`)

	return (
		<div className="flex h-full flex-col gap-4">
			<div className="mx-12 mt-8 flex flex-col gap-4">
				<Breadcrumb>
					<Breadcrumb.Item>Operations</Breadcrumb.Item>
					<Breadcrumb.Item>Sprint</Breadcrumb.Item>
				</Breadcrumb>

				<div className="flex justify-between">
					<div className="flex items-center gap-4">
						<h1 className="text-2xl font-semibold">Sprint Board</h1>
						<Tag color="volcano">Sprint ends {currentSprintEndDate.fromNow()}</Tag>
					</div>
					<div className="flex items-center gap-6">
						<label className="flex items-center gap-2">
							My stories only <Switch checked={myStoriesOnly} onChange={(value) => setMyStoriesOnly(value)} />
						</label>
						{versions && (
							<Select
								value={currentVersionId}
								onChange={(value) => setCurrentVersionId(value)}
								options={[
									{label: `All versions`, value: `__ALL_VERSIONS__`},
									...versions.docs.map((version) => ({
										label: `Version ${version.data().name}`,
										value: version.id,
									})),
								]}
								className="w-40"
							/>
						)}
					</div>
				</div>
			</div>

			<Tabs
				className="grow [&_.ant-tabs-content]:h-full [&_.ant-tabs-nav]:px-12 [&_.ant-tabs-tabpane]:h-full"
				items={[
					{
						key: `view`,
						label: (
							<span>
								<EyeOutlined /> View
							</span>
						),
						children: (
							<div className="flex h-full w-full grow overflow-x-auto pl-12 pb-8">
								<div className="grid h-full grid-cols-[repeat(14,20rem)] gap-4">
									{storyMapState &&
										versions &&
										Object.entries(sprintColumns).map(([columnName, title]) => (
											<SprintColumn
												key={columnName}
												columnName={columnName}
												title={title}
												storyMapState={storyMapState}
												allVersions={versions}
												currentVersionId={currentVersionId}
												myStoriesOnly={myStoriesOnly}
											/>
										))}
								</div>

								{/* Spacer because padding doesn't work in the overflow */}
								<div className="shrink-0 basis-12" />
							</div>
						),
					},
					{
						key: `plan`,
						label: (
							<span>
								<OrderedListOutlined /> Plan
							</span>
						),
					},
					{
						key: `refine`,
						label: (
							<span>
								<FileSearchOutlined /> Refine
							</span>
						),
					},
					{
						key: `critique`,
						label: (
							<span>
								<AuditOutlined /> Critique
							</span>
						),
					},
					{
						key: `review`,
						label: (
							<span>
								<CodeSandboxOutlined /> Review
							</span>
						),
					},
				]}
			/>
		</div>
	)
}

export default SprintClientPage

const findPreviousOccurenceOfDayOfWeek = (date: Dayjs, dayOfWeek: number) => {
	const currentDay = date.day()
	const daysUntilTarget = (currentDay - dayOfWeek + 7) % 7
	const previousOccurence = date.subtract(daysUntilTarget, `day`)
	return previousOccurence.startOf(`day`)
}
