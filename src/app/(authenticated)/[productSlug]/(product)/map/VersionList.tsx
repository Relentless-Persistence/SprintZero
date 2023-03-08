"use client"

import {MinusCircleOutlined} from "@ant-design/icons"
import {Button, Input, Tabs} from "antd"
import {addDoc, collection, getDocs, query, where} from "firebase/firestore"
import {useEffect} from "react"

import type {DocumentReference, QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {Dispatch, FC, SetStateAction} from "react"
import type {Product} from "~/types/db/Products"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import {VersionConverter} from "~/types/db/Products/Versions"
import {AllVersions} from "~/utils/storyMap"

export type VersionListProps = {
	product: QueryDocumentSnapshot<Product>
	allVersions: QuerySnapshot<Version>
	currentVersionId: string | typeof AllVersions | undefined
	setCurrentVersionId: (id: string | typeof AllVersions) => void
	newVersionInputValue: string | undefined
	setNewVersionInputValue: (value: string | undefined) => void
	storyMapItems: QuerySnapshot<StoryMapItem>
	editMode: boolean
	setItemsToBeDeleted: Dispatch<SetStateAction<string[]>>
	versionsToBeDeleted: string[]
	setVersionsToBeDeleted: Dispatch<SetStateAction<string[]>>
}

const VersionList: FC<VersionListProps> = ({
	product,
	allVersions,
	currentVersionId,
	setCurrentVersionId,
	newVersionInputValue,
	setNewVersionInputValue,
	storyMapItems,
	editMode,
	setItemsToBeDeleted,
	versionsToBeDeleted,
	setVersionsToBeDeleted,
}) => {
	useEffect(() => {
		if (currentVersionId === undefined && allVersions.docs[0]?.exists()) setCurrentVersionId(allVersions.docs[0].id)
	}, [currentVersionId, setCurrentVersionId, allVersions.docs])

	const addVersion = async (): Promise<DocumentReference<Version>> => {
		if (!newVersionInputValue) throw new Error(`Version name is required.`)
		const existingDoc = (
			await getDocs(query(collection(product.ref, `Versions`), where(`name`, `==`, newVersionInputValue)))
		).docs[0]
		if (existingDoc) throw new Error(`Version already exists.`)

		const data: Version = {
			deleted: false,
			name: newVersionInputValue,
		}
		return await addDoc(collection(product.ref, `Versions`).withConverter(VersionConverter), data)
	}

	return (
		<Tabs
			tabPosition="right"
			onChange={(key) => {
				if (key !== `__NEW_VERSION__`) setCurrentVersionId(key)
			}}
			activeKey={currentVersionId}
			items={allVersions.docs
				.filter((version) => !versionsToBeDeleted.includes(version.id))
				.sort((a, b) => a.data().name.localeCompare(b.data().name))
				.map((version) => ({
					key: version.id,
					label: (
						<div className="flex w-full justify-between gap-1">
							<p className="overflow-hidden truncate">{version.data().name}</p>
							{editMode && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation()
										if (currentVersionId === version.id) setCurrentVersionId(AllVersions)
										setVersionsToBeDeleted((versions) => [...versions, version.id])
										const itemsWithVersion = storyMapItems.docs
											.filter((item) => item.data().versionId === version.id)
											.map((item) => item.id)
										itemsWithVersion.forEach((id) => {
											setItemsToBeDeleted((items) => [...items, id])
										})
									}}
								>
									<MinusCircleOutlined className="!mr-0 text-error" />
								</button>
							)}
						</div>
					),
				}))
				.concat([
					{
						key: AllVersions,
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
										<Input.Group compact className="-mx-2 -my-2 w-[calc(100%+1rem)]">
											<Input
												size="small"
												autoFocus
												value={newVersionInputValue}
												onChange={(e) => setNewVersionInputValue(e.target.value)}
												onPressEnter={() => {
													if (newVersionInputValue)
														addVersion()
															.then((doc) => {
																setNewVersionInputValue(undefined)
																setCurrentVersionId(doc.id)
															})
															.catch(console.error)
												}}
												onKeyDown={(e) => {
													if (e.key === `Escape`) setNewVersionInputValue(undefined)
												}}
												className="!w-12"
											/>
											<Button
												size="small"
												icon={<MinusCircleOutlined className="!mr-0" />}
												onClick={() => setNewVersionInputValue(undefined)}
												className="!inline-grid place-items-center !text-xs"
											/>
										</Input.Group>
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
