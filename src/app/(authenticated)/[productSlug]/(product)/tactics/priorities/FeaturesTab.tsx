"use client"

import {Breadcrumb, Select} from "antd"
import {useEffect, useRef, useState} from "react"

import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"

import Feature from "./Feature"
import {matrixRect, pointerLocation} from "./globals"
import PrioritiesMatrix from "./PrioritiesMatrix"
import {getEpics, getFeatures} from "~/utils/storyMap"

export type FeaturesTabProps = {
	storyMapItems: StoryMapItem[]
}

const FeaturesTab: FC<FeaturesTabProps> = ({storyMapItems}) => {
	const [selectedEpic, setSelectedEpic] = useState<string | undefined>(undefined)

	const epics = getEpics(storyMapItems)
	const features = getFeatures(storyMapItems)

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
		<div className="flex h-full flex-col px-12 py-8">
			<div className="flex justify-between">
				<Breadcrumb items={[{title: `Tactics`}, {title: `Priorities`}, {title: `Features`}]} />

				<div className="h-0">
					<Select
						placeholder="Select an epic..."
						options={epics.map((epic) => ({value: epic.id, label: epic.name}))}
						onChange={(value: string) => setSelectedEpic(value)}
						className="w-48"
					/>
				</div>
			</div>

			<p className="mt-2 text-textTertiary">
				Assess the practicality of proposed items to objectively and rationally uncover strengths and weaknesses,
				opportunities and threats, the resources required to carry through, and ultimately the prospects for success
			</p>

			<div className="relative mt-6 grow">
				<div className="absolute inset-0" ref={matrixRef}>
					<PrioritiesMatrix>
						{selectedEpic &&
							features
								.filter((feature) => feature.parentId === selectedEpic)
								.map((feature) => <Feature key={feature.id} featureId={feature.id} storyMapItems={storyMapItems} />)}
					</PrioritiesMatrix>
				</div>
			</div>
		</div>
	)
}

export default FeaturesTab
