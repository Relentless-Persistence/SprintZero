"use client"

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Button} from "antd5"

import type {ReactElement} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import StoryMapInput from "~/app/dashboard/StoryMapInput"
import useMainStore from "~/stores/mainStore"
import {addFeature, getAllFeatures, renameEpic} from "~/utils/fetch"

type Props = {
	epic: EpicType
}

const Epic = ({epic}: Props): ReactElement | null => {
	const queryClient = useQueryClient()
	const activeProductId = useMainStore((state) => state.activeProductId)

	const {data: features} = useQuery({
		queryKey: [`all-features`, activeProductId],
		queryFn: getAllFeatures(activeProductId!),
		select: (data) => data.filter((feature) => feature.epic === epic.id),
		enabled: activeProductId !== null,
	})

	const addFeatureMutation = useMutation({
		mutationFn: addFeature(activeProductId!, epic.id),
		onSuccess: () => void queryClient.invalidateQueries({queryKey: [`all-features`, activeProductId], exact: true}),
	})

	const renameEpicMutation = useMutation({
		mutationFn: renameEpic(epic.id),
	})

	return (
		<div className="hover:bg-green-t800">
			<StoryMapInput value={epic.name} onChange={(value) => void renameEpicMutation.mutate(value)} />
			<ul>
				{features?.map((feature) => (
					<li key={feature.id}>{feature.name}</li>
				))}
			</ul>
			<Button onClick={() => void addFeatureMutation.mutate({name: `feature`, description: `description`})}>
				Add feature
			</Button>
		</div>
	)
}

export default Epic
