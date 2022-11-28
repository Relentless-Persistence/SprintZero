"use client"

import {useMutation, useQueryClient} from "@tanstack/react-query"
import {Button} from "antd5"
import {collection, onSnapshot, query, where} from "firebase9/firestore"
import {Reorder} from "framer-motion"
import {useEffect, useState} from "react"

import type {ReactElement} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import Epic from "./Epic"
import {db} from "~/config/firebase"
import useMainStore from "~/stores/mainStore"
import {EpicCollectionSchema, Epics} from "~/types/db/Epics"
import {addEpic, reorderEpic} from "~/utils/fetch"

const StoryMap = (): ReactElement | null => {
	const queryClient = useQueryClient()
	const activeProductId = useMainStore((state) => state.activeProductId)

	const [epics, setEpics] = useState<EpicType[]>([])
	useEffect(() => {
		const unsubscribe = onSnapshot(
			query(collection(db, Epics._), where(Epics.product, `==`, activeProductId)),
			(doc) => {
				const data = EpicCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				const orderedEpics: EpicType[] = []
				let currentEpic = data.find((epic) => epic.prevEpic === null)
				while (currentEpic) {
					orderedEpics.push(currentEpic)
					currentEpic = data.find((epic) => epic.prevEpic === currentEpic!.id)
				}
				setEpics(orderedEpics)
			},
		)
		return unsubscribe
	}, [activeProductId])

	const handleReorder = (newOrder: EpicType[]) => {
		// Find the epic where its position in the new order is different from the position in the old order
		const movedEpic = epics.find(
			(epic) =>
				newOrder.findIndex((newEpic) => newEpic.id === epic.id) !== epics.findIndex((epic) => epic.id === epic.id),
		)!
		const movedEpicIndex = newOrder.findIndex((newEpic) => newEpic.id === movedEpic.id)

		const prevEpic = newOrder[movedEpicIndex - 1]
		reorderEpic(movedEpic.id, prevEpic?.id ?? null, epics)
	}

	const addEpicMutation = useMutation({
		mutationFn: activeProductId ? addEpic(activeProductId) : async () => {},
		onSuccess: () => void queryClient.invalidateQueries({queryKey: [`all-epics`, activeProductId], exact: true}),
	})

	return (
		<div>
			<Reorder.Group axis="x" values={epics} onReorder={handleReorder} className="flex gap-8">
				{epics.map((epic) => (
					<Reorder.Item key={epic.id} value={epic}>
						<Epic epic={epic} />
					</Reorder.Item>
				))}
			</Reorder.Group>
			<Button onClick={() => void addEpicMutation.mutate({name: `Epic`, description: `description`})}>Add epic</Button>
		</div>
	)
}

export default StoryMap
