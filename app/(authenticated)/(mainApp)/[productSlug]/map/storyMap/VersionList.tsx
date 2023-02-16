"use client"

import {Input, Tabs} from "antd"
import {addDoc, collection, getDocs, query, where} from "firebase/firestore"
import {useEffect} from "react"

import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {Version} from "~/types/db/Versions"

import {db} from "~/utils/firebase"

export type VersionListProps = {
	allVersions: QuerySnapshot<Version>
	currentVersionId: Id | `__ALL_VERSIONS__` | undefined
	setCurrentVersionId: (id: Id | `__ALL_VERSIONS__`) => void
	newVersionInputValue: string | undefined
	setNewVersionInputValue: (value: string | undefined) => void
	storyMapStateId: Id
}

const VersionList: FC<VersionListProps> = ({
	allVersions,
	currentVersionId,
	setCurrentVersionId,
	newVersionInputValue,
	setNewVersionInputValue,
	storyMapStateId,
}) => {
	useEffect(() => {
		if (currentVersionId === undefined && allVersions.docs[0]?.exists())
			setCurrentVersionId(allVersions.docs[0].id as Id)
	}, [currentVersionId, setCurrentVersionId, allVersions.docs])

	const addVersion = async (): Promise<void> => {
		if (!newVersionInputValue) throw new Error(`Version name is required.`)
		const existingDoc = (
			await getDocs(
				query(collection(db, `StoryMapStates`, storyMapStateId, `Versions`), where(`name`, `==`, newVersionInputValue)),
			)
		).docs[0]
		if (existingDoc) throw new Error(`Version already exists.`)

		const data: Version = {
			name: newVersionInputValue,
		}
		await addDoc(collection(db, `StoryMapStates`, storyMapStateId, `Versions`), data)
	}

	return (
		<Tabs
			tabPosition="right"
			onChange={(key) => {
				if (key !== `__NEW_VERSION__`) setCurrentVersionId(key as Id)
			}}
			activeKey={currentVersionId}
			items={allVersions.docs
				.sort((a, b) => a.data().name.localeCompare(b.data().name))
				.map((version) => ({
					key: version.id as Id | string,
					label: <p className="overflow-hidden truncate">{version.data().name}</p>,
				}))
				.concat([
					{
						key: `__ALL_VERSIONS__`,
						label: <p>All</p>,
					},
				])
				.concat(
					newVersionInputValue !== undefined
						? [
								{
									key: `__NEW_VERSION__`,
									label: (
										<Input
											size="small"
											autoFocus
											value={newVersionInputValue}
											onChange={(e) => setNewVersionInputValue(e.target.value)}
											onPressEnter={() => {
												if (newVersionInputValue)
													addVersion()
														.then(() => {
															setNewVersionInputValue(undefined)
														})
														.catch(console.error)
											}}
											className="-mx-2 -my-2 w-[calc(100%+1rem)]"
										/>
									),
								},
						  ]
						: [],
				)}
			className="h-full min-w-0"
		/>
	)
}

export default VersionList
