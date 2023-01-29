"use client"

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Button, Input, Tabs} from "antd5"
import {useAtom} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"

import {currentVersionAtom, newVersionInputAtom} from "./atoms"
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
		enabled: activeProductId !== undefined,
	})

	const hasSetInitialVersion = useRef(false)
	useEffect(() => {
		if (!hasSetInitialVersion.current && versions?.[0]) {
			setCurrentVersion({id: versions[0].id, name: versions[0].name})
			hasSetInitialVersion.current = true
		}
	}, [setCurrentVersion, versions])

	const addVersionMutation = useMutation({
		mutationFn: addVersion,
		onSuccess: () => {
			setNewVersionInput(undefined)
			queryClient.invalidateQueries({queryKey: [`all-versions`, activeProductId], exact: true})
		},
	})

	return (
		<div className="flex flex-col gap-8">
			<Tabs
				tabPosition="right"
				onChange={(key) =>
					void setCurrentVersion({id: key as Id, name: versions?.find((version) => version.id === key)?.name ?? `All`})
				}
				activeKey={currentVersion.id}
				items={[
					...(versions ?? []).map((version) => ({
						key: version.id,
						label: version.name,
					})),
					{
						key: `__ALL_VERSIONS__`,
						label: `All`,
					},
				]}
				className="bg-transparent"
			/>

			{newVersionInput !== undefined && (
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
						placeholder="Version name"
						className="w-full"
					/>
					<Button htmlType="submit" className="bg-white">
						Add
					</Button>
					{addVersionMutation.isError && addVersionMutation.error instanceof Error && (
						<p>{addVersionMutation.error.message}</p>
					)}
				</form>
			)}
		</div>
	)
}

export default VersionList