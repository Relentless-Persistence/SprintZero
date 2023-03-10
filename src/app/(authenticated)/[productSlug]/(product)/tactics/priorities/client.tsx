"use client"

import {Tabs} from "antd"
import {collection} from "firebase/firestore"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import EpicsTab from "./EpicsTab"
import FeaturesTab from "./FeaturesTab"
import {useAppContext} from "~/app/(authenticated)/AppContext"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"

const PrioritiesClientPage: FC = () => {
	const {product} = useAppContext()
	const [storyMapItems] = useCollection(collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter))

	if (!storyMapItems) return null
	return (
		<div className="h-full">
			<Tabs
				tabPosition="right"
				items={[
					{key: `epics`, label: `Epics`, children: <EpicsTab storyMapItems={storyMapItems} />},
					{key: `features`, label: `Features`, children: <FeaturesTab storyMapItems={storyMapItems} />},
				]}
				style={{height: `100%`}}
			/>
		</div>
	)
}

export default PrioritiesClientPage
