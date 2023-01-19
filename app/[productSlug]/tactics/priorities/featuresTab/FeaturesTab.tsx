import {Breadcrumb, Select} from "antd5"
import {doc, onSnapshot} from "firebase9/firestore"
import {useEffect, useRef, useState} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/Products"

import Feature from "./Feature"
import {matrixRect, pointerLocation} from "../globals"
import PrioritiesMatrix from "../PrioritiesMatrix"
import {db} from "~/config/firebase"
import {Products, ProductSchema} from "~/types/db/Products"
import {useActiveProductId} from "~/utils/useActiveProductId"

const FeaturesTab: FC = () => {
	const activeProductId = useActiveProductId()
	const [selectedEpic, setSelectedEpic] = useState<Id | undefined>(undefined)
	const [storyMapState, setStoryMapState] = useState<StoryMapState>({
		productId: activeProductId!,
		epics: [],
		features: [],
		stories: [],
	})

	const matrixRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		if (!matrixRef.current) return

		matrixRect.current = matrixRef.current.getBoundingClientRect()
		const onResize = () => {
			matrixRect.current = matrixRef.current!.getBoundingClientRect()
		}

		window.addEventListener(`resize`, onResize)

		return () => {
			window.removeEventListener(`resize`, onResize)
		}
	}, [])

	useEffect(() => {
		if (!activeProductId) return

		return onSnapshot(doc(db, Products._, activeProductId), (doc) => {
			const data = ProductSchema.parse({id: doc.id, ...doc.data()})
			setStoryMapState(data.storyMapState)
		})
	}, [activeProductId])

	useEffect(() => {
		const onPointerMove = (e: PointerEvent) => {
			pointerLocation.current = [e.clientX, e.clientY]
		}

		window.addEventListener(`pointermove`, onPointerMove)

		return () => {
			window.removeEventListener(`pointermove`, onPointerMove)
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
					options={storyMapState.epics.map((epic) => ({value: epic.id, label: epic.name}))}
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
							storyMapState.epics
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
