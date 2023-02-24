"use client"

import {Breadcrumb, Select} from "antd"
import dayjs from "dayjs"
import {collection, doc, query, where} from "firebase/firestore"
import {groupBy} from "lodash"
import {useEffect, useMemo, useRef, useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {Dayjs} from "dayjs"
import type {FC} from "react"

import SprintColumn from "./SprintColumn"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter, sprintColumns} from "~/types/db/StoryMapStates"
import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"
import {getStories} from "~/utils/storyMap"
import {useActiveProductId} from "~/utils/useActiveProductId"

const SprintClientPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
	const [storyMapStates] = useCollection(
		query(collection(db, `StoryMapStates`), where(`productId`, `==`, activeProductId)).withConverter(
			StoryMapStateConverter,
		),
	)
	const storyMapState = storyMapStates?.docs[0]

	const stories = storyMapState ? getStories(storyMapState.data()) : []
	const oldestStoryDate = stories.reduce((oldestDate, story) => {
		const storyDate = dayjs(story.createdAt.toDate())
		if (storyDate.isBefore(oldestDate)) return storyDate
		else return oldestDate
	}, dayjs(`9999-12-31`))

	const firstSprintStartDate = activeProduct?.exists()
		? findPreviousOccurenceOfDayOfWeek(oldestStoryDate, activeProduct.data().sprintStartDayOfWeek)
		: undefined

	const sprints = useMemo(() => {
		const sprints: Array<{startDate: string; endDate: string}> = []
		let dateCursor = firstSprintStartDate
		while (dateCursor && dateCursor.isBefore(dayjs())) {
			const sprintStartDate = dateCursor.format(`YYYY-MM-DD`)
			dateCursor = dateCursor.add(6, `day`)
			const sprintEndDate = dateCursor.format(`YYYY-MM-DD`)
			sprints.push({startDate: sprintStartDate, endDate: sprintEndDate})
			dateCursor = dateCursor.add(1, `day`)
		}
		return sprints
	}, [firstSprintStartDate])
	const sprintsGrouped = groupBy(sprints, (sprint) => sprint.startDate.slice(0, 4))

	const [currentSprint, setCurrentSprint] = useState(``)
	const hasSetDefaultSprint = useRef(false)
	useEffect(() => {
		if (!hasSetDefaultSprint.current && sprints.length > 0) {
			setCurrentSprint(sprints.at(-1)!.startDate)
			hasSetDefaultSprint.current = true
		}
	}, [sprints])

	const [allVersions] = useCollection(
		storyMapState
			? collection(db, `StoryMapStates`, storyMapState.id, `Versions`).withConverter(VersionConverter)
			: undefined,
	)

	return (
		<div className="flex h-full flex-col gap-6">
			<div className="mx-12 mt-8 flex justify-between">
				<Breadcrumb>
					<Breadcrumb.Item>Operations</Breadcrumb.Item>
					<Breadcrumb.Item>Sprint</Breadcrumb.Item>
				</Breadcrumb>

				<div className="flex items-center gap-4">
					<label htmlFor="sprint-selector" className="font-semibold">
						Start / End Dates
					</label>
					<Select
						id="sprint-selector"
						value={currentSprint}
						onChange={(value) => setCurrentSprint(value)}
						options={Object.entries(sprintsGrouped).map(([year, sprints]) => ({
							label: year,
							options: sprints.map(({startDate, endDate}) => ({
								label: `${dayjs(startDate).format(`MMM D`)} - ${dayjs(endDate).format(`MMM D`)}`,
								value: startDate,
							})),
						}))}
						className="w-40"
					/>
				</div>
			</div>

			{activeProduct?.exists() && (
				<div className="flex w-full grow overflow-x-auto pl-12 pb-8">
					<div className="grid h-full grid-cols-[repeat(12,14rem)] gap-4">
						{storyMapState &&
							allVersions &&
							Object.entries(sprintColumns).map(([id, title]) => (
								<SprintColumn
									key={id}
									id={id}
									title={title}
									sprintStartDate={currentSprint}
									storyMapState={storyMapState}
									allVersions={allVersions}
								/>
							))}
					</div>

					{/* Spacer because padding doesn't work in the overflow */}
					<div className="shrink-0 basis-12" />
				</div>
			)}
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
