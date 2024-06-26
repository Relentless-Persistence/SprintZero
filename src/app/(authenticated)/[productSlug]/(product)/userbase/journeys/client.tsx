"use client"

import {Breadcrumb, Button, Tabs} from "antd"
import clsx from "clsx"
import {addDoc, collection, deleteDoc, doc, updateDoc} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import AddJourneyPage from "./AddJourneyPage"
import EventDrawer from "./EventDrawer"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {JourneyConverter, durationUnits} from "~/types/db/Products/Journeys"
import {EventConverter} from "~/types/db/Products/Journeys/Events"

const JourneysClientPage: FC = () => {
	const {product} = useAppContext()
	const [journeys, journeysLoading, journeysError] = useCollection(
		collection(product.ref, `Journeys`).withConverter(JourneyConverter),
	)
	useErrorHandler(journeysError)

	const [activeJourney, setActiveJourney] = useState<string | `new` | undefined>(undefined)
	useEffect(() => {
		if (!journeysLoading) setActiveJourney(!journeys || journeys.docs.length === 0 ? `new` : journeys.docs[0]!.id)
	}, [journeys, journeysLoading])
	const journey = journeys?.docs.find((journey) => journey.id === activeJourney)

	const [journeyEvents, , journeyEventsError] = useCollection(
		activeJourney !== undefined && activeJourney !== `new`
			? collection(product.ref, `Journeys`, activeJourney, `Events`).withConverter(EventConverter)
			: undefined,
	)
	useErrorHandler(journeyEventsError)

	const [activeEventId, setActiveEventId] = useState<string | undefined>(undefined)
	const activeEvent = journeyEvents?.docs.find((event) => event.id === activeEventId)

	if (activeJourney === `new`)
		return (
			<AddJourneyPage
				onCancel={() => setActiveJourney(journeys?.docs[0]?.id)}
				onFinish={(id) => setActiveJourney(id)}
			/>
		)
	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex h-full flex-col gap-6 px-12 py-8">
				<div className="flex justify-between">
					<Breadcrumb items={[{title: `Userbase`}, {title: `Journeys`}]} />

					<Button onClick={() => setActiveEventId(`new`)}>Add Event</Button>
				</div>

				<div className="relative grow">
					{/* Blobs */}
					<div className="pointer-events-none absolute top-[2.125rem] bottom-[2.125rem] left-6 right-1/2">
						{journey &&
							journeyEvents?.docs.map((event) => (
								<div
									key={event.id}
									className={clsx(
										`absolute right-0 rounded-l-[100%_50%]`,
										event.data().emotion === `frustrated` && `bg-[#ff4d4f]`,
										event.data().emotion === `delighted` && `bg-[#009cd5]`,
									)}
									style={{
										width: `${event.data().emotionLevel}%`,
										height: `${((event.data().end - event.data().start) / journey.data().duration) * 100}%`,
										top: `${(event.data().start / journey.data().duration) * 100}%`,
									}}
								/>
							))}
					</div>

					{/* Horizontal axis */}
					<div className="absolute top-[2.125rem] left-6 w-[calc(50%-1.825rem)] border-t border-dashed border-textTertiary" />
					<p className="absolute top-10 left-6 text-xs text-textTertiary">High</p>
					<p className="absolute top-10 right-1/2 mr-2 text-xs text-textTertiary">Low</p>

					{/* Vertical axis */}
					<p className="absolute left-1/2 -translate-x-1/2 font-semibold text-textTertiary">Start</p>
					<div className="absolute left-1/2 top-7 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-textTertiary bg-bgLayout" />
					{journey && (
						<p className="absolute left-1/2 top-[2.125rem] ml-3 -translate-y-1/2 text-xs">
							{durationUnits[journey.data().durationUnit]} 0
						</p>
					)}
					<div className="absolute top-0 left-1/2 my-10 h-[calc(100%-5rem)] w-0.5 -translate-x-1/2 bg-textTertiary" />
					<div className="absolute left-1/2 bottom-7 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-textTertiary bg-bgLayout" />
					{journey && (
						<p className="absolute left-1/2 bottom-[2.125rem] ml-3 translate-y-1/2 text-xs">
							{durationUnits[journey.data().durationUnit]} {journey.data().duration}
						</p>
					)}
					<p className="absolute left-1/2 bottom-0 -translate-x-1/2 font-semibold text-textTertiary">Finish</p>

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

					{/* Event labels */}
					<div className="pointer-events-none absolute top-[2.125rem] bottom-[2.125rem] right-0 left-1/2">
						{journey &&
							journeyEvents?.docs.map((event) => (
								<button
									key={event.id}
									type="button"
									onClick={() => setActiveEventId(event.id)}
									className="pointer-events-auto absolute flex -translate-y-1/2 items-center gap-1 text-left"
									style={{top: `${((event.data().start + event.data().end) / 2 / journey.data().duration) * 100}%`}}
								>
									<div className="h-3 w-3 shrink-0 -translate-x-1/2 rounded-full border-2 border-textTertiary bg-bgLayout" />
									<div className="min-w-0 flex-1 leading-normal">
										<p className="font-semibold">{event.data().subject}</p>
										<p className="font-light">{event.data().description}</p>
									</div>
								</button>
							))}
					</div>
				</div>
			</div>

			{journeys && (
				<Tabs
					tabPosition="right"
					activeKey={activeJourney}
					onChange={(key) => setActiveJourney(key || `new`)}
					items={journeys.docs
						.map((journey) => ({key: journey.id || `new`, label: journey.data().name}))
						.concat({key: `new`, label: `Add`})}
				/>
			)}

			{journey && activeEventId && (
				<EventDrawer
					journey={journey}
					activeEvent={activeEvent}
					onClose={() => setActiveEventId(undefined)}
					onCommit={async (data) => {
						if (!activeEventId) return
						if (activeEventId === `new`) await addDoc(collection(product.ref, `Journeys`, journey.id, `Events`), data)
						else await updateDoc(doc(product.ref, `Journeys`, journey.id, `Events`, activeEventId), data)
					}}
					onDelete={async () => {
						if (activeEventId !== `new`)
							await deleteDoc(doc(product.ref, `Journeys`, journey.id, `Events`, activeEventId))
					}}
				/>
			)}
		</div>
	)
}

export default JourneysClientPage
