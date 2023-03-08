import {Breadcrumb} from "antd"
import {collection, query, where} from "firebase/firestore"
import {useEffect, useRef} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Product} from "~/types/db/Products"

import Epic from "./Epic"
import {matrixRect, pointerLocation} from "./globals"
import PrioritiesMatrix from "./PrioritiesMatrix"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"
import {db} from "~/utils/firebase"
import {getEpics} from "~/utils/storyMap"

export type EpicsTabProps = {
	activeProduct: QueryDocumentSnapshot<Product>
}

const EpicsTab: FC<EpicsTabProps> = ({activeProduct}) => {
	const [storyMapStates] = useCollection(
		query(collection(db, `StoryMapStates`), where(`productId`, `==`, activeProduct.id)).withConverter(
			StoryMapItemConverter,
		),
	)
	const storyMapState = storyMapStates?.docs[0]

	const epics = storyMapState ? getEpics(storyMapState.data().items) : []

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
			<Breadcrumb>
				<Breadcrumb.Item>Tactics</Breadcrumb.Item>
				<Breadcrumb.Item>Priorities</Breadcrumb.Item>
				<Breadcrumb.Item>Epics</Breadcrumb.Item>
			</Breadcrumb>

			<p className="mt-2 text-textTertiary">
				Assess the practicality of proposed items to objectively and rationally uncover strengths and weaknesses,
				opportunities and threats, the resources required to carry through, and ultimately the prospects for success
			</p>

			<div className="relative mt-6 grow">
				<div className="absolute inset-0" ref={matrixRef}>
					<PrioritiesMatrix>
						{storyMapState?.exists() &&
							epics.map((epic) => <Epic key={epic.id} epicId={epic.id} storyMapState={storyMapState} />)}
					</PrioritiesMatrix>
				</div>
			</div>
		</div>
	)
}

export default EpicsTab
