"use client"

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Button, Input, Menu} from "antd5"
import {useAtom} from "jotai"

import type {FC} from "react"

import {currentVersionAtom, newVersionInputAtom} from "./storyMap/atoms"
import {addVersion} from "~/utils/api/mutations"
import {getVersionsByProduct} from "~/utils/api/queries"
import {useActiveProductId} from "~/utils/useActiveProductId"

const VersionList: FC = () => {
	const queryClient = useQueryClient()
	const activeProductId = useActiveProductId()
	const [newVersionInput, setNewVersionInput] = useAtom(newVersionInputAtom)

	const [currentVersion, setCurrentVersion] = useAtom(currentVersionAtom)

	const {data: versions} = useQuery({
		queryKey: [`all-versions`, activeProductId],
		queryFn: getVersionsByProduct(activeProductId!),
		enabled: activeProductId !== null,
	})

	const addVersionMutation = useMutation({
		mutationFn: addVersion,
		onSuccess: () => {
			setNewVersionInput(null)
			queryClient.invalidateQueries({queryKey: [`all-versions`, activeProductId], exact: true})
		},
	})

	return (
		<div>
			<Menu
				selectedKeys={[currentVersion.id]}
				items={[
					...(versions ?? []).map((version) => ({
						key: version.id,
						label: version.name,
						onClick: () => void setCurrentVersion({id: version.id, name: version.name}),
					})),
					{
						key: `__ALL_VERSIONS__`,
						label: `All`,
						onClick: () => void setCurrentVersion({id: `__ALL_VERSIONS__`, name: `All`}),
					},
				]}
				className="bg-transparent"
			/>
			{newVersionInput !== null && (
				<form
					onSubmit={(evt) => {
						evt.preventDefault()
						addVersionMutation.mutate({productId: activeProductId!, versionName: newVersionInput})
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
