import {Breadcrumb} from "antd5"
import {doc, onSnapshot} from "firebase9/firestore"
import {useEffect, useRef, useState} from "react"

import type {FC} from "react"
import type {StoryMapState} from "~/types/db/Products"

import {matrixRect, pointerLocation} from "../globals"
import PrioritiesMatrix from "../PrioritiesMatrix"
import Epic from "./Epic"
import {db} from "~/config/firebase"
import {Products, ProductSchema} from "~/types/db/Products"
import {useActiveProductId} from "~/utils/useActiveProductId"

const EpicsTab: FC = () => {
	const activeProductId = useActiveProductId()
	const [storyMapState, setStoryMapState] = useState<StoryMapState>({
		productId: activeProductId!,
		epics: [],
		features: [],
		stories: [],
	})

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
		if (!activeProductId) return

		return onSnapshot(doc(db, Products._, activeProductId), (doc) => {
			const data = ProductSchema.parse({id: doc.id, ...doc.data()})
			setStoryMapState(data.storyMapState)
		})
	}, [activeProductId])

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
			<Breadcrumb>
				<Breadcrumb.Item>Tactics</Breadcrumb.Item>
				<Breadcrumb.Item>Priorities</Breadcrumb.Item>
				<Breadcrumb.Item>Epics</Breadcrumb.Item>
			</Breadcrumb>

			<p className="text-laurel">
				Assess the practicality of proposed items to objectively and rationally uncover strengths and weaknesses,
				opportunities and threats, the resources required to carry through, and ultimately the prospects for success
			</p>

			<div className="relative grow">
				<div className="absolute inset-0" ref={matrixRef}>
					<PrioritiesMatrix>
						{storyMapState.epics.map((epic) => (
							<Epic key={epic.id} epic={epic} storyMapState={storyMapState} />
						))}
					</PrioritiesMatrix>
				</div>
			</div>
		</div>
	)
}

export default EpicsTab
