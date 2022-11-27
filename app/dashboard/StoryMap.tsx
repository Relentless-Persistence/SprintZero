"use client"

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Button} from "antd5"

import type {ReactElement} from "react"

import Epic from "./Epic"
import useMainStore from "~/stores/mainStore"
import {addEpic, getAllEpics} from "~/utils/fetch"

const StoryMap = (): ReactElement | null => {
	const queryClient = useQueryClient()
	const activeProductId = useMainStore((state) => state.activeProductId)

	const {data: epics} = useQuery({
		queryKey: [`all-epics`, activeProductId],
		queryFn: getAllEpics(activeProductId!),
		enabled: activeProductId !== null,
	})

	const addEpicMutation = useMutation({
		mutationFn: activeProductId ? addEpic(activeProductId) : async () => {},
		onSuccess: () => void queryClient.invalidateQueries({queryKey: [`all-epics`, activeProductId], exact: true}),
	})

	return (
		<div>
			{epics?.map((epic) => (
				<Epic key={epic.id} epic={epic} />
			))}
			<Button onClick={() => void addEpicMutation.mutate({name: `Epic`, description: `description`})}>Add epic</Button>
		</div>
	)
}

export default StoryMap
