"use client"

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Button, Input, Menu} from "antd5"

import type {FC} from "react"

import {useStoryMapStore} from "./storyMapStore"
import useMainStore from "~/stores/mainStore"
import {addVersion, getAllVersions} from "~/utils/fetch"

const VersionList: FC = () => {
	const queryClient = useQueryClient()
	const activeProduct = useMainStore((state) => state.activeProduct)
	const newVersionInput = useStoryMapStore((state) => state.newVersionInput)
	const setNewVersionInput = useStoryMapStore((state) => state.setNewVersionInput)

	const currentVersion = useStoryMapStore((state) => state.currentVersion)
	const setCurrentVersion = useStoryMapStore((state) => state.setCurrentVersion)

	const {data: versions} = useQuery({
		queryKey: [`all-versions`, activeProduct],
		queryFn: getAllVersions(activeProduct!),
		onSuccess: (versions) => {
			if (currentVersion === `` && versions[0]) setCurrentVersion(versions[0].id)
		},
		enabled: activeProduct !== null,
	})

	const addVersionMutation = useMutation({
		mutationFn: activeProduct ? addVersion(activeProduct) : async () => {},
		onSuccess: () => {
			setNewVersionInput(null)
			queryClient.invalidateQueries({queryKey: [`all-versions`, activeProduct], exact: true})
		},
	})

	return (
		<div>
			<Menu
				selectedKeys={[currentVersion]}
				items={[
					...(versions ?? []).map((version) => ({
						key: version.id,
						label: version.name,
						onClick: () => void setCurrentVersion(version.id),
					})),
					{key: `__ALL_VERSIONS__`, label: `All`, onClick: () => void setCurrentVersion(`__ALL_VERSIONS__`)},
				]}
				className="bg-transparent"
			/>
			{newVersionInput !== null && (
				<form
					onSubmit={(evt) => {
						evt.preventDefault()
						addVersionMutation.mutate(newVersionInput)
					}}
					className="flex flex-col gap-2"
				>
					<Input
						value={newVersionInput}
						onChange={(evt) => void setNewVersionInput(evt.target.value)}
						htmlSize={1}
						className="w-full"
					/>
					<Button htmlType="submit">Add</Button>
					{addVersionMutation.isError && addVersionMutation.error instanceof Error && (
						<p>{addVersionMutation.error.message}</p>
					)}
				</form>
			)}
		</div>
	)
}

export default VersionList
