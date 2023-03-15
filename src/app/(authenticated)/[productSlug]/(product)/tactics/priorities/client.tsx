"use client"

import {Tabs} from "antd"
import {collection} from "firebase/firestore"
import {useErrorHandler} from "react-error-boundary"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import EpicsTab from "./EpicsTab"
import FeaturesTab from "./FeaturesTab"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"

const PrioritiesClientPage: FC = () => {
	const {product} = useAppContext()
	const [storyMapItems, , storyMapItemsError] = useCollection(
		collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter),
	)
	useErrorHandler(storyMapItemsError)

	if (!storyMapItems) return null
	return (
		<div className="h-full">
			<Tabs
				tabPosition="right"
				items={[
					{
						key: `epics`,
						label: `Epics`,
						children: <EpicsTab storyMapItems={storyMapItems.docs.map((item) => item.data())} />,
					},
					{
						key: `features`,
						label: `Features`,
						children: <FeaturesTab storyMapItems={storyMapItems.docs.map((item) => item.data())} />,
					},
				]}
				style={{height: `100%`}}
			/>
		</div>
	)
}

export default PrioritiesClientPage
