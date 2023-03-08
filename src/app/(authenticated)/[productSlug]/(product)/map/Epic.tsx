import {MinusCircleOutlined, ReadOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {collection, updateDoc} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Product} from "~/types/db/Products"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"

import {elementRegistry} from "./globals"
import {VersionConverter} from "~/types/db/Products/Versions"
import {updateItem} from "~/utils/storyMap"

export type EpicProps = {
	product: QueryDocumentSnapshot<Product>
	storyMapItems: QuerySnapshot<StoryMapItem>
	epicId: string
	editMode: boolean
	onMarkForDeletion: (id: string) => void
	inert?: boolean
}

const Epic: FC<EpicProps> = ({product, storyMapItems, epicId, editMode, onMarkForDeletion, inert = false}) => {
	const epic = storyMapItems.docs.find((item) => item.id === epicId)!
	const children = storyMapItems.docs.filter((item) => item.data().parentId === epicId)
	const grandchildren = storyMapItems.docs.filter((item) => children.some((child) => child.id === item.data().parentId))

	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !contentRef.current) return
		elementRegistry[epicId] = contentRef.current
		return () => {
			if (!contentRef.current) return
			elementRegistry[epicId] = contentRef.current // eslint-disable-line react-hooks/exhaustive-deps
		}
	}, [epicId, inert])

	const [localEpicName, setLocalEpicName] = useState(epic.data().name)
	useEffect(() => {
		setLocalEpicName(epic.data().name)
	}, [epic])

	const [versions] = useCollection(collection(product.ref, `Versions`).withConverter(VersionConverter))

	return (
		<div
			className={clsx(
				`flex touch-none select-none items-center gap-2 rounded border border-current bg-bgContainer px-2 py-1 font-medium leading-tight text-[#4f2dc8] dark:text-[#6b44f8]`,
				inert && `cursor-grabbing`,
				!editMode && `cursor-grab active:cursor-grabbing`,
			)}
			ref={contentRef}
		>
			<ReadOutlined />
			{(epic.data().initialRenameDone || inert) && !editMode ? (
				<p className={clsx(`my-0.5`, localEpicName === `` && `invisible`)}>{localEpicName || `_`}</p>
			) : (
				<div className="relative my-0.5 min-w-[1rem]">
					<p>{localEpicName || `_`}</p>
					<input
						value={localEpicName}
						autoFocus={!epic.data().initialRenameDone && !editMode}
						onBlur={() => {
							updateDoc(epic.ref, {initialRenameDone: true}).catch(console.error)
						}}
						onKeyDown={(e) => {
							if (e.key === `Enter`) updateDoc(epic.ref, {initialRenameDone: true}).catch(console.error)
						}}
						className="absolute inset-0 w-full rounded-sm bg-bgContainer focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-primaryHover"
						onChange={(e) => {
							if (!versions) return
							setLocalEpicName(e.target.value)
							updateItem(product, storyMapItems, epic.id, {name: e.target.value}, versions).catch(console.error)
						}}
						onPointerDownCapture={(e) => e.stopPropagation()}
					/>
				</div>
			)}
			{editMode && (
				<button
					type="button"
					onClick={() => {
						onMarkForDeletion(epic.id)
						children.forEach((feature) => onMarkForDeletion(feature.id))
						grandchildren.forEach((story) => onMarkForDeletion(story.id))
					}}
				>
					<MinusCircleOutlined className="text-sm text-error" />
				</button>
			)}
		</div>
	)
}

export default Epic
