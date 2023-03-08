import {CopyOutlined, MinusCircleOutlined} from "@ant-design/icons"
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

export type FeatureProps = {
	product: QueryDocumentSnapshot<Product>
	storyMapItems: QuerySnapshot<StoryMapItem>
	featureId: string
	editMode: boolean
	onMarkForDeletion: (id: string) => void
	inert?: boolean
}

const Feature: FC<FeatureProps> = ({product, storyMapItems, featureId, editMode, onMarkForDeletion, inert = false}) => {
	const feature = storyMapItems.docs.find((feature) => feature.id === featureId)!
	const children = storyMapItems.docs.filter((item) => item.data().parentId === featureId)

	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !contentRef.current) return
		elementRegistry[featureId] = contentRef.current
		return () => {
			if (!contentRef.current) return
			elementRegistry[featureId] = contentRef.current // eslint-disable-line react-hooks/exhaustive-deps
		}
	}, [featureId, inert])

	const [localFeatureName, setLocalFeatureName] = useState(feature.data().name)
	useEffect(() => {
		setLocalFeatureName(feature.data().name)
	}, [feature])

	const [versions] = useCollection(collection(product.ref, `Versions`).withConverter(VersionConverter))

	return (
		<div
			className={clsx(
				`flex min-w-[4rem] touch-none select-none items-center gap-2 rounded border border-current bg-bgContainer px-2 py-1 font-medium leading-tight text-[#006378] dark:text-[#00a2c4]`,
				inert && `cursor-grabbing`,
				!editMode && `cursor-grab active:cursor-grabbing`,
			)}
			ref={contentRef}
		>
			<CopyOutlined />
			{(feature.data().initialRenameDone || inert) && !editMode ? (
				<p className={clsx(`my-0.5`, localFeatureName === `` && `invisible`)}>{localFeatureName || `_`}</p>
			) : (
				<div className="relative my-0.5 min-w-[1rem]">
					<p>{localFeatureName || `_`}</p>
					<input
						value={localFeatureName}
						autoFocus={!feature.data().initialRenameDone && !editMode}
						onBlur={() => {
							updateDoc(feature.ref, {initialRenameDone: true}).catch(console.error)
						}}
						onKeyDown={(e) => {
							if (e.key === `Enter`) updateDoc(feature.ref, {initialRenameDone: true}).catch(console.error)
						}}
						className="absolute inset-0 w-full rounded-sm bg-bgContainer focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-primaryHover"
						onChange={(e) => {
							if (!versions) return
							setLocalFeatureName(e.target.value)
							updateItem(product, storyMapItems, feature.id, {name: e.target.value}, versions).catch(console.error)
						}}
						onPointerDownCapture={(e) => e.stopPropagation()}
					/>
				</div>
			)}
			{editMode && (
				<button
					type="button"
					onClick={() => {
						onMarkForDeletion(featureId)
						children.forEach((story) => onMarkForDeletion(story.id))
					}}
				>
					<MinusCircleOutlined className="text-sm text-error" />
				</button>
			)}
		</div>
	)
}

export default Feature
