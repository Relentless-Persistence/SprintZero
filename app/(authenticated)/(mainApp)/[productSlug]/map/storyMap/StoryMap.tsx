import {ReadOutlined} from "@ant-design/icons"
import {doc} from "firebase/firestore"
import {motion, useMotionValue, useTransform} from "framer-motion"
import {useEffect, useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {DragInfo} from "./utils/types"
import type {FC} from "react"
import type {Id, WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"

import Epic from "./Epic"
import Feature from "./Feature"
import Story from "./Story"
import {elementRegistry} from "./utils/globals"
import {genMeta} from "./utils/meta"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {db} from "~/utils/firebase"
import {sortEpics} from "~/utils/storyMap"

export type StoryMapProps = {
	activeProduct: WithDocumentData<Product>
	currentVersionId: Id | `__ALL_VERSIONS__`
}

const StoryMap: FC<StoryMapProps> = ({activeProduct, currentVersionId}) => {
	const [storyMapState] = useDocumentData(
		doc(db, `StoryMapStates`, activeProduct.storyMapStateId).withConverter(StoryMapStateConverter),
		{
			initialValue: {
				id: activeProduct.storyMapStateId,
				items: {},
				productId: activeProduct.id,
				ref: doc(db, `StoryMapStates`, activeProduct.storyMapStateId).withConverter(StoryMapStateConverter),
			},
		},
	)
	invariant(storyMapState, `storyMapState must exist`)

	const meta = genMeta(storyMapState, currentVersionId)

	const [dragInfo, setDragInfo] = useState<DragInfo>({
		mousePos: [useMotionValue(0), useMotionValue(0)],
		itemBeingDragged: undefined,
		offset: [0, 0],
	})

	useEffect(() => {
		if (typeof window !== `undefined`) {
			const handlePointerMove = (e: PointerEvent) => {
				dragInfo.mousePos[0].set(e.clientX)
				dragInfo.mousePos[1].set(e.clientY)
			}
			window.addEventListener(`pointermove`, handlePointerMove)

			return () => {
				window.removeEventListener(`pointermove`, handlePointerMove)
			}
		}
	}, [dragInfo.mousePos])

	const onPanStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
		for (const [id, element] of Object.entries(elementRegistry)) {
			if (event.target && element?.contains(event.target as Node)) {
				const container = element.parentElement!
				setDragInfo((prev) => ({
					...prev,
					itemBeingDragged: id as Id,
					offset: [
						prev.mousePos[0].get() - container.getBoundingClientRect().left,
						prev.mousePos[1].get() - container.getBoundingClientRect().top,
					],
				}))
				break
			}
		}
	}

	const onPanEnd = () => {
		setDragInfo((prev) => ({
			...prev,
			itemBeingDragged: undefined,
		}))
	}

	return (
		<motion.div className="relative z-10 flex w-max items-start gap-8" onPanStart={onPanStart} onPanEnd={onPanEnd}>
			{sortEpics(meta.epics).map((epic) => (
				<Epic key={epic.id} meta={meta} dragInfo={dragInfo} epicId={epic.id} />
			))}

			<button
				type="button"
				onClick={() => {
					meta.addEpic({}).catch(console.error)
				}}
				className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#4f2dc8] transition-colors hover:bg-[#faf8ff]"
				data-testid="add-epic"
			>
				<ReadOutlined />
				<span>Add epic</span>
			</button>

			<motion.div
				className="fixed top-0 left-0 z-20 cursor-grabbing"
				style={{
					x: useTransform(dragInfo.mousePos[0], (x) => x - dragInfo.offset[0]),
					y: useTransform(dragInfo.mousePos[1], (y) => y - dragInfo.offset[1]),
				}}
			>
				{(() => {
					const item = Object.entries(storyMapState.items).find(([id]) => id === dragInfo.itemBeingDragged)
					switch (item?.[1]!.type) {
						case `epic`:
							return <Epic meta={meta} dragInfo={dragInfo} epicId={item[0] as Id} inert />
						case `feature`:
							return <Feature meta={meta} dragInfo={dragInfo} featureId={item[0] as Id} inert />
						case `story`:
							return <Story meta={meta} dragInfo={dragInfo} storyId={item[0] as Id} inert />
					}
				})()}
			</motion.div>
		</motion.div>
	)
}

export default StoryMap
