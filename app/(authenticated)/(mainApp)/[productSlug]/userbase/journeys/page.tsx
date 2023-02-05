"use client"

import {Breadcrumb, Button, Tabs} from "antd"
import {collection, query, where} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"

import AddJourneyPage from "./AddJourneyPage"
import {JourneyEvents} from "~/types/db/JourneyEvents"
import {durationUnits, JourneyConverter, Journeys} from "~/types/db/Journeys"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const JourneysPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [journeys, loading] = useCollectionData(
		query(collection(db, Journeys._), where(Journeys.productId, `==`, activeProductId)).withConverter(JourneyConverter),
	)

	const [activeJourney, setActiveJourney] = useState<Id | `new` | undefined>(undefined)
	useEffect(() => {
		if (!loading) setActiveJourney(!journeys || journeys.length === 0 ? `new` : journeys[0]!.id)
	}, [journeys, loading])
	const journey = journeys?.find((journey) => journey.id === activeJourney)

	const [journeyEvents] = useCollectionData(
		activeJourney !== undefined && activeJourney !== `new`
			? collection(db, Journeys._, activeJourney, JourneyEvents._)
			: undefined,
	)

	if (activeJourney === `new`)
		return (
			<AddJourneyPage
				onCancel={() => void setActiveJourney(journeys?.[0]?.id)}
				onFinish={(id) => void setActiveJourney(id)}
			/>
		)
	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex h-full flex-col gap-6 px-12 py-8">
				<div className="flex justify-between">
					<Breadcrumb>
						<Breadcrumb.Item>Userbase</Breadcrumb.Item>
						<Breadcrumb.Item>Journeys</Breadcrumb.Item>
					</Breadcrumb>

					<Button>Add Event</Button>
				</div>

				<div className="relative grow">
					{/* Horizontal axis */}
					<div className="absolute top-[2.125rem] w-[calc(50%-0.325rem)] border-t border-dashed border-laurel" />
					<p className="absolute top-10 text-xs text-laurel">High</p>
					<p className="absolute top-10 right-1/2 mr-2 text-xs text-laurel">Low</p>

					{/* Vertical axis */}
					<p className="absolute left-1/2 -translate-x-1/2 font-semibold text-[#a6ae9d]">Start</p>
					<div className="absolute left-1/2 top-7 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-laurel" />
					{journey && (
						<p className="absolute left-1/2 top-[2.125rem] ml-3 -translate-y-1/2 text-xs">
							{durationUnits[journey.durationUnit]} 1
						</p>
					)}
					<div className="absolute top-0 left-1/2 my-10 h-[calc(100%-5rem)] w-0.5 -translate-x-1/2 bg-laurel" />
					<div className="absolute left-1/2 bottom-7 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-laurel" />
					{journey && (
						<p className="absolute left-1/2 bottom-[2.125rem] ml-3 translate-y-1/2 text-xs">
							{durationUnits[journey.durationUnit]} {journey.duration}
						</p>
					)}
					<p className="absolute left-1/2 bottom-0 -translate-x-1/2 font-semibold text-[#a6ae9d]">Finish</p>

					{/* Legend */}
					<div className="absolute top-1/2 left-0 flex origin-top -translate-x-1/2 -rotate-90 gap-8">
						<div className="flex items-center gap-2">
							<p className="text-xs">Frustrated</p>
							<div className="h-3 w-6 rounded-full bg-[#ff4d4f]" />
						</div>
						<div className="flex items-center gap-2">
							<p className="text-xs">Delighted</p>
							<div className="h-3 w-6 rounded-full bg-[#009cd5]" />
						</div>
					</div>

					{/* Events */}
					<div className="pointer-events-none relative h-full w-full py-10">
						{journeyEvents?.map((event) => (
							<div key={event.id} />
						))}
					</div>
				</div>
			</div>

			{journeys && (
				<Tabs
					tabPosition="right"
					activeKey={activeJourney}
					onChange={(key) => void setActiveJourney(key as Id | `new`)}
					items={journeys
						.map((journey) => ({key: journey.id as Id | `new`, label: journey.name}))
						.concat({key: `new`, label: `Add`})}
				/>
			)}
		</div>
	)
}

export default JourneysPage
