import {Breadcrumb} from "antd"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"

import Epic from "./Epic"
import {matrixRect, pointerLocation} from "./globals"
import PrioritiesMatrix from "./PrioritiesMatrix"
import {getEpics} from "~/utils/storyMap"

export type EpicsTabProps = {
	storyMapItems: StoryMapItem[]
}

const EpicsTab: FC<EpicsTabProps> = ({storyMapItems}) => {
	const epics = getEpics(storyMapItems)

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
			<Breadcrumb items={[{title: `Tactics`}, {title: `Priorities`}, {title: `Epics`}]} />

			<p className="mt-2 text-textTertiary">
				Assess the practicality of proposed items to objectively and rationally uncover strengths and weaknesses,
				opportunities and threats, the resources required to carry through, and ultimately the prospects for success
			</p>

			<div className="relative mt-6 grow">
				<div className="absolute inset-0" ref={matrixRef}>
					<PrioritiesMatrix>
						{epics.map((epic) => (
							<Epic key={epic.id} epicId={epic.id} storyMapItems={storyMapItems} />
						))}
					</PrioritiesMatrix>
				</div>
			</div>
		</div>
	)
}

export default EpicsTab
