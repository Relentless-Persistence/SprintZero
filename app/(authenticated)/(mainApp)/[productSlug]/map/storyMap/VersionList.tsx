"use client"

import {Input, Tabs} from "antd"
import {addDoc, collection, getDocs, query, where} from "firebase/firestore"
import {useEffect} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Version} from "~/types/db/Versions"

import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"

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
		query(collection(db, `StoryMapStates`, storyMapStateId, `Versions`)).withConverter(VersionConverter),
	)
	useEffect(() => {
		if (currentVersionId === undefined && versions?.[0]) setCurrentVersionId(versions[0].id)
	}, [currentVersionId, setCurrentVersionId, versions])

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
			items={(versions ?? [])
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((version) => ({
					key: version.id as Id | string,
					label: <p className="overflow-hidden truncate">{version.name}</p>,
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
