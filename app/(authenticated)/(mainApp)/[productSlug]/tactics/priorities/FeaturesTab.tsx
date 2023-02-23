"use client"

import {Breadcrumb, Select} from "antd"
import {collection, query, where} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"

import Feature from "./Feature"
import {matrixRect, pointerLocation} from "../globals"
import PrioritiesMatrix from "../PrioritiesMatrix"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {db} from "~/utils/firebase"
import {getEpics, getFeatures} from "~/utils/storyMap"

export type FeaturesTabProps = {
	activeProduct: QueryDocumentSnapshot<Product>
}

const FeaturesTab: FC<FeaturesTabProps> = ({activeProduct}) => {
	const [selectedEpic, setSelectedEpic] = useState<Id | undefined>(undefined)
	const [storyMapStates] = useCollection(
		query(collection(db, `StoryMapStates`), where(`productId`, `==`, activeProduct.id)).withConverter(
			StoryMapStateConverter,
		),
	)
	const storyMapState = storyMapStates?.docs[0]

	const epics = storyMapState ? getEpics(storyMapState.data()) : []
	const features = storyMapState ? getFeatures(storyMapState.data()) : []

	const matrixRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		if (typeof window !== `undefined`) {
			if (!matrixRef.current) return

			matrixRect.current = matrixRef.current.getBoundingClientRect()
			const onResize = () => {
				matrixRect.current = matrixRef.current!.getBoundingClientRect()
			}

			window.addEventListener(`resize`, onResize)

			return () => {
				window.removeEventListener(`resize`, onResize)
			}
		}
	}, [])

	useEffect(() => {
		if (typeof window !== `undefined`) {
			const onPointerMove = (e: PointerEvent) => {
				pointerLocation.current = [e.clientX, e.clientY]
			}

			window.addEventListener(`pointermove`, onPointerMove)

			return () => {
				window.removeEventListener(`pointermove`, onPointerMove)
			}
		}
	}, [])

	return (
		<div className="flex h-full flex-col gap-6 px-12 py-8">
			<div className="flex justify-between">
				<Breadcrumb>
					<Breadcrumb.Item>Tactics</Breadcrumb.Item>
					<Breadcrumb.Item>Priorities</Breadcrumb.Item>
					<Breadcrumb.Item>Features</Breadcrumb.Item>
				</Breadcrumb>

				<Select
					placeholder="Select an epic"
					options={epics.map((epic) => ({value: epic.id, label: epic.name}))}
					onChange={(value) => setSelectedEpic(value as Id)}
				/>
			</div>

			<p className="text-laurel">
				Assess the practicality of proposed items to objectively and rationally uncover strengths and weaknesses,
				opportunities and threats, the resources required to carry through, and ultimately the prospects for success
			</p>

			<div className="relative grow">
				<div className="absolute inset-0" ref={matrixRef}>
					<PrioritiesMatrix>
						{selectedEpic &&
							storyMapState?.exists() &&
							features
								.filter((feature) => feature.parentId === selectedEpic)
								.map((feature) => <Feature key={feature.id} featureId={feature.id} storyMapState={storyMapState} />)}
					</PrioritiesMatrix>
				</div>
			</div>
		</div>
	)
}

export default FeaturesTab
