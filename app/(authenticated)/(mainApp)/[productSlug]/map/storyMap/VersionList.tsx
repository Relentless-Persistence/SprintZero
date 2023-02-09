"use client"

import {Button, Input, Tabs} from "antd"
import {collection, query} from "firebase/firestore"
import {useEffect} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"

import {StoryMapStates} from "~/types/db/StoryMapStates"
import {VersionConverter, Versions} from "~/types/db/Versions"
import {db} from "~/utils/firebase"
import {addVersion} from "~/utils/mutations"

export type VersionListProps = {
	currentVersionId: Id | `__ALL_VERSIONS__` | undefined
	setCurrentVersionId: (id: Id | `__ALL_VERSIONS__`) => void
	newVersionInputValue: string | undefined
	setNewVersionInputValue: (value: string | undefined) => void
	storyMapStateId: Id
}

const VersionList: FC<VersionListProps> = ({
	currentVersionId,
	setCurrentVersionId,
	newVersionInputValue,
	setNewVersionInputValue,
	storyMapStateId,
}) => {
	const [versions] = useCollectionData(
		query(collection(db, StoryMapStates._, storyMapStateId, Versions._)).withConverter(VersionConverter),
	)
	useEffect(() => {
		if (currentVersionId === undefined && versions?.[0]) setCurrentVersionId(versions[0].id)
	}, [currentVersionId, setCurrentVersionId, versions])

	return (
		<div className="flex flex-col gap-8">
			<Tabs
				tabPosition="right"
				onChange={(key) => setCurrentVersionId(key as Id)}
				activeKey={currentVersionId}
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

			{newVersionInputValue !== undefined && (
				<form
					onSubmit={(evt) => {
						evt.preventDefault()
						addVersion({storyMapStateId, versionName: newVersionInputValue})
							.then(() => {
								setNewVersionInputValue(undefined)
							})
							.catch(console.error)
					}}
					className="flex flex-col gap-2"
				>
					<Input
						value={newVersionInputValue}
						onChange={(evt) => setNewVersionInputValue(evt.target.value)}
						htmlSize={1}
						placeholder="Version name"
						className="w-full"
					/>
					<Button htmlType="submit" className="bg-white">
						Add
					</Button>
				</form>
			)}
		</div>
	)
}

export default VersionList
