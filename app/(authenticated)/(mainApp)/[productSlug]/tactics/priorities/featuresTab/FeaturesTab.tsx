"use client"

import {Breadcrumb, Select} from "antd"
import {doc} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id, WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"

import Feature from "./Feature"
import {matrixRect, pointerLocation} from "../globals"
import PrioritiesMatrix from "../PrioritiesMatrix"
import {StoryMapStates, StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {db} from "~/utils/firebase"

export type FeaturesTabProps = {
	activeProduct: WithDocumentData<Product>
}

const FeaturesTab: FC<FeaturesTabProps> = ({activeProduct}) => {
	const [selectedEpic, setSelectedEpic] = useState<Id | undefined>(undefined)
	const [storyMapState] = useDocumentData(
		doc(db, StoryMapStates._, activeProduct.storyMapStateId).withConverter(StoryMapStateConverter),
	)

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
					options={storyMapState?.epics.map((epic) => ({value: epic.id, label: epic.name}))}
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
							storyMapState?.epics
								.find((epic) => epic.id === selectedEpic)!
								.featureIds.map((id) => storyMapState.features.find((feature) => feature.id === id)!)
								.map((feature) => <Feature key={feature.id} feature={feature} storyMapState={storyMapState} />)}
					</PrioritiesMatrix>
				</div>
			</div>
		</div>
	)
}

export default FeaturesTab