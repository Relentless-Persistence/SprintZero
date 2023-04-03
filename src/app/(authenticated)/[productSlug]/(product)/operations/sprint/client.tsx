"use client"

import {
	AuditOutlined,
	CodeSandboxOutlined,
	EyeOutlined,
	FileSearchOutlined,
	OrderedListOutlined,
} from "@ant-design/icons"
import { Breadcrumb, Select, Switch, Tabs, Tag } from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { collection, orderBy, query } from "firebase/firestore"
import { useMemo, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { Dayjs } from "dayjs"
import type { FC } from "react"

import SprintColumn from "./SprintColumn"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { StoryMapItemConverter, sprintColumns } from "~/types/db/Products/StoryMapItems"
import { VersionConverter } from "~/types/db/Products/Versions"
import { AllVersions } from "~/utils/storyMap"

dayjs.extend(relativeTime)

const SprintClientPage: FC = () => {
	const { product } = useAppContext()
	const [storyMapItems, , storyMapItemsError] = useCollection(
		collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter),
	)
	useErrorHandler(storyMapItemsError)
	const [myStoriesOnly, setMyStoriesOnly] = useState(false)

	const firstSprintStartDate = findPreviousOccurenceOfDayOfWeek(
		dayjs(product.data().createdAt.toMillis()),
		product.data().sprintStartDayOfWeek,
	)
	const sprints = useMemo(() => {
		if (!product.exists()) return []
		const sprints: Array<{ startDate: string; endDate: string }> = []
		let dateCursor = firstSprintStartDate
		while (dateCursor.isBefore(dayjs())) {
			const sprintStartDate = dateCursor.format(`YYYY-MM-DD`)
			dateCursor = dateCursor.add(product.data().cadence - 1, `week`)
			dateCursor = dateCursor.add(6, `day`)
			const sprintEndDate = dateCursor.format(`YYYY-MM-DD`)
			sprints.push({ startDate: sprintStartDate, endDate: sprintEndDate })
			dateCursor = dateCursor.add(1, `day`)
		}
		return sprints
	}, [product, firstSprintStartDate])
	const currentSprintEndDate = dayjs(sprints.at(-1)?.endDate)

	const [versions, , versionsError] = useCollection(
		query(collection(product.ref, `Versions`), orderBy(`name`, `asc`)).withConverter(VersionConverter),
	)
	useErrorHandler(versionsError)

	const [currentVersionId, setCurrentVersionId] = useState<string>(AllVersions)

	return (
		<div className="flex h-full flex-col gap-4">
			<div className="mx-12 mt-8 flex flex-col gap-4">
				<Breadcrumb items={[{ title: `Operations` }, { title: `Sprint` }]} />

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
									{ label: `All versions`, value: AllVersions },
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
				className="min-h-0 grow [&_.ant-tabs-content]:h-full [&_.ant-tabs-nav]:px-12 [&_.ant-tabs-tabpane]:h-full"
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
									{storyMapItems &&
										versions &&
										Object.entries(sprintColumns).map(([columnName, title]) => (
											<SprintColumn
												key={columnName}
												columnName={columnName}
												title={title}
												storyMapItems={storyMapItems.docs.map((item) => item.data())}
												versions={versions}
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
						disabled: true,
						label: (
							<span>
								<OrderedListOutlined /> Plan
							</span>
						),
					},
					{
						key: `refine`,
						disabled: true,
						label: (
							<span>
								<FileSearchOutlined /> Refine
							</span>
						),
					},
					{
						key: `critique`,
						disabled: true,
						label: (
							<span>
								<AuditOutlined /> Critique
							</span>
						),
					},
					{
						key: `review`,
						disabled: true,
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
