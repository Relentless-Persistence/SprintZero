"use client"

import {useAtomValue} from "jotai"
import {useEffect} from "react"

import type {FC} from "react"

import AddEpicButton from "./AddEpicButton"
import {epicsAtom, featuresAtom, storiesAtom, storyMapStateAtom} from "./atoms"
import Epic from "./epic/Epic"
import {calculateDividers, useSubscribeToData} from "./utils"

const StoryMap: FC = () => {
	const epics = useAtomValue(epicsAtom)
	const features = useAtomValue(featuresAtom)
	const stories = useAtomValue(storiesAtom)
	const storyMapState = useAtomValue(storyMapStateAtom)

	useSubscribeToData()
	useEffect(() => {
		calculateDividers()
	}, [epics, features, stories, storyMapState])

	return (
		<div className="relative z-10 flex w-max items-start gap-8">
			{epics.map((epic) => (
				<Epic key={epic.id} epic={epic} />
			))}
			<AddEpicButton />
		</div>
	)
}

export default StoryMap
