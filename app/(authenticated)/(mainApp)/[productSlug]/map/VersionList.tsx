"use client"

import {MinusCircleOutlined} from "@ant-design/icons"
import {Input, Tabs} from "antd"
import {addDoc, collection, getDocs, query, where} from "firebase/firestore"
import {useEffect} from "react"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {Dispatch, FC, SetStateAction} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import {db} from "~/utils/firebase"

export type VersionListProps = {
	allVersions: QuerySnapshot<Version>
	currentVersionId: Id | `__ALL_VERSIONS__` | undefined
	setCurrentVersionId: (id: Id | `__ALL_VERSIONS__`) => void
	newVersionInputValue: string | undefined
	setNewVersionInputValue: (value: string | undefined) => void
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	editMode: boolean
	setItemsToBeDeleted: Dispatch<SetStateAction<Id[]>>
	versionsToBeDeleted: Id[]
	setVersionsToBeDeleted: Dispatch<SetStateAction<Id[]>>
}

const VersionList: FC<VersionListProps> = ({
	allVersions,
	currentVersionId,
	setCurrentVersionId,
	newVersionInputValue,
	setNewVersionInputValue,
	storyMapState,
	editMode,
	setItemsToBeDeleted,
	versionsToBeDeleted,
	setVersionsToBeDeleted,
}) => {
	useEffect(() => {
		if (currentVersionId === undefined && allVersions.docs[0]?.exists())
			setCurrentVersionId(allVersions.docs[0].id as Id)
	}, [currentVersionId, setCurrentVersionId, allVersions.docs])

	const addVersion = async (): Promise<void> => {
		if (!newVersionInputValue) throw new Error(`Version name is required.`)
		const existingDoc = (
			await getDocs(
				query(
					collection(db, `StoryMapStates`, storyMapState.id, `Versions`),
					where(`name`, `==`, newVersionInputValue),
				),
			)
		).docs[0]
		if (existingDoc) throw new Error(`Version already exists.`)

		const data: Version = {
			name: newVersionInputValue,
		}
		await addDoc(collection(db, `StoryMapStates`, storyMapState.id, `Versions`), data)
	}

	return (
		<Tabs
			tabPosition="right"
			onChange={(key) => {
				if (key !== `__NEW_VERSION__`) setCurrentVersionId(key as Id)
			}}
			activeKey={currentVersionId}
			items={allVersions.docs
				.filter((version) => !versionsToBeDeleted.includes(version.id as Id))
				.sort((a, b) => a.data().name.localeCompare(b.data().name))
				.map((version) => ({
					key: version.id as Id | string,
					label: (
						<div className="flex w-full justify-between gap-1">
							<p className="overflow-hidden truncate">{version.data().name}</p>
							{editMode && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation()
										if (currentVersionId === version.id) setCurrentVersionId(`__ALL_VERSIONS__`)
										setVersionsToBeDeleted((versions) => [...versions, version.id as Id])
										const itemsWithVersion = Object.entries(storyMapState.data().items)
											.filter(([, item]) => item?.versionId === version.id)
											.map(([id]) => id)
										itemsWithVersion.forEach((id) => {
											setItemsToBeDeleted((items) => [...items, id as Id])
										})
									}}
								>
									<MinusCircleOutlined className="!mr-0 text-[#ff4d4f]" />
								</button>
							)}
						</div>
					),
				}))
				.concat([
					{
						key: `__ALL_VERSIONS__`,
						label: (
							<p data-all className="text-left">
								All
							</p>
						),
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
											onKeyDown={(e) => {
												if (e.key === `Escape`) setNewVersionInputValue(undefined)
											}}
											className="-mx-2 -my-2 w-[calc(100%+1rem)]"
										/>
									),
								},
						  ]
						: [],
				)}
			className="h-full min-w-0 [&>.ant-tabs-nav]:w-full [&_.ant-tabs-tab-btn]:w-full"
		/>
	)
}

export default VersionList
