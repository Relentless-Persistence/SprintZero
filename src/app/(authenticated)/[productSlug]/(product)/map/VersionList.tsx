"use client"

import { MinusCircleOutlined } from "@ant-design/icons"
import Icon from "@ant-design/icons/lib/components/Icon"
import { Alert, Button, Input, Tabs, Tag, notification } from "antd"
import { addDoc, collection, getDocs, query, where } from "firebase/firestore"
import { debounce } from 'lodash';
import { useEffect, useMemo, useRef, useState } from "react"

import type { InputRef } from "antd";
import type { DocumentReference } from "firebase/firestore"
import type { FC } from "react"
import type { Version } from "~/types/db/Products/Versions"

import { useStoryMapContext } from "./StoryMapContext"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { VersionConverter } from "~/types/db/Products/Versions"
import { AllVersions, getStories } from "~/utils/storyMap"
import CheckCircleFilled from "~public/icons/check-circle-filled.svg"
import CloseCircleFilled from "~public/icons/close-circle-filled.svg"



const VersionList: FC = () => {
	const { product } = useAppContext()
	const {
		versions,
		currentVersionId,
		setCurrentVersionId,
		newVersionInputValue,
		setNewVersionInputValue,
		storyMapItems,
		editMode,
		setItemsToBeDeleted,
		versionsToBeDeleted,
		setVersionsToBeDeleted,
	} = useStoryMapContext()

	//const [isVersionValid, setVersionIsValid] = useState<boolean>()

	const inputRef = useRef<InputRef | null>(null);
	const [isAddingVersion, setIsAddingVersion] = useState<boolean>(false);



	const isVersionValid = useMemo(() => {
		const semanticVersionRegex =
			/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
		return semanticVersionRegex.test(newVersionInputValue!);
	}, [newVersionInputValue]);

	useEffect(() => {
		if (inputRef.current && !isVersionValid && newVersionInputValue) {
			//console.log(`have reached until focus code`)
			inputRef.current.focus();
		}
	}, [newVersionInputValue, isVersionValid]);

	// const checkIfVersionIsValid = (version: string) => {
	// 	// Check if the value is a valid semantic version number
	// 	const semanticVersionRegex =
	// 		/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
	// 	const isValidVersion = semanticVersionRegex.test(version)
	// 	// if (isValidVersion) {
	// 	// 	setVersionIsValid(true)
	// 	// } else {
	// 	// 	setVersionIsValid(false)
	// 	// 	//throw new Error(`Invalid semantic version number`)
	// 	// }
	// 	setNewVersionInputValue(version)
	// }

	//const debouncedCheck = debounce(checkIfVersionIsValid, 300); // waits 300ms after the last call to run

	const addVersion = async (): Promise<DocumentReference<Version>> => {
		if (!newVersionInputValue) throw new Error(`Version name is required.`)

		// Check if the value is a valid semantic version number
		// const semanticVersionRegex =
		// 	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
		// const isValidVersion = semanticVersionRegex.test(newVersionInputValue)
		// if (isValidVersion) {
		// 	setVersionIsValid(true)
		// } else {
		// 	setVersionIsValid(false)
		// 	throw new Error(`Invalid semantic version number`)
		// }
		//checkIfVersionIsValid(newVersionInputValue)

		const existingDoc = (
			await getDocs(query(collection(product.ref, `Versions`), where(`name`, `==`, newVersionInputValue), where(`deleted`, `!=`, true)))
		).docs[0]
		if (existingDoc) {
			notification.warning({ message: `Release number you entered already exists.` })
			throw new Error(`Version already exists.`)
		}

		const data: Version = {
			deleted: false,
			name: newVersionInputValue,
			updates: {
				changed: {
					description: ``,
					updatedAt: new Date().toISOString(),
				},
				change: {
					description: ``,
					updatedAt: new Date().toISOString(),
				},
				impact: {
					description: ``,
					updatedAt: new Date().toISOString(),
				},
			},
		}

		const newVersion = await addDoc(collection(product.ref, `Versions`).withConverter(VersionConverter), data)
		setIsAddingVersion(false)

		return newVersion
	}

	const stories = getStories(storyMapItems)

	const storyLength = (id: string) => {
		const story = stories.filter(story => story.versionId === id)
		return story.length
	}

	return (
		<Tabs
			tabPosition="right"
			onChange={(key) => {
				if (key !== `__ADD_VERSION__`) setCurrentVersionId(key)
			}}
			activeKey={currentVersionId}
			items={versions.docs
				.filter((version) =>
					!versionsToBeDeleted.includes(version.id) && !version.data().deleted
				)
				.sort((a, b) => a.data().name.localeCompare(b.data().name))
				.map((version) => ({
					key: version.id,
					label: (
						<div>
							{/* <div className="flex justify-between"> */}
							<div className="flex items-center justify-between space-x-3">
								<p className="overflow-hidden truncate">{version.data().name}</p>

								<Tag
									hidden={editMode}
									style={
										version.id === currentVersionId
											? { border: `1px solid #A7C983`, backgroundColor: `#DDE3D5` }
											: {}
									}
									className="text-right"
								>
									{storyLength(version.id)}
								</Tag>
								{editMode && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation()
											if (currentVersionId === version.id) setCurrentVersionId(AllVersions)
											setVersionsToBeDeleted((versions) => [...versions, version.id])
											const itemsWithVersion = storyMapItems
												.filter((item) => item.versionId === version.id)
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

						</div>
					),
				}))
				.concat(
					// newVersionInputValue !== undefined
					// 	? 
					isAddingVersion ? [
						{
							key: `__NEW_VERSION__`,
							label: (
								<Input.Group compact className="-my-2 mt-1 mb-1">
									<Input
										style={{ textAlign: `left` }}
										ref={inputRef}
										disabled={editMode}
										//style={{ borderStyle: `dashed` }}
										placeholder="1.0.0"
										size="small"
										//autoFocus
										value={newVersionInputValue}
										onChange={(e) => {
											setNewVersionInputValue(e.target.value)
										}
										}
										status={newVersionInputValue ? (newVersionInputValue.length > 0 && isVersionValid ? `` : `error`) : ``}
										suffix={newVersionInputValue ? (newVersionInputValue.length > 0 && isVersionValid ? <CheckCircleFilled /> : <CloseCircleFilled />) : ``}


										//help={!isVersionValid && `Please enter a valid semantic version number`}
										onPressEnter={() => {
											if (newVersionInputValue)
												addVersion()
													.then((doc) => {
														setNewVersionInputValue(undefined)
														setCurrentVersionId(doc.id)
													})
													.catch(console.error)
										}}
										onBlur={(e) => {
											setNewVersionInputValue(undefined)
											setIsAddingVersion(false)
											//setVersionIsValid(true)
										}}
										onKeyDown={(e) => {
											if (e.key === `Escape`) {
												setNewVersionInputValue(undefined)
												//setVersionIsValid(true)
											}
										}}
										className="!w-25"
									/>
									{/* <Button
											size="small"
											icon={<MinusCircleOutlined className="!mr-0" />}
											onClick={() => setNewVersionInputValue(undefined)}
											className="!inline-grid place-items-center !text-xs"
										/> */}
								</Input.Group>
							),
						},
					]
						: [],
				)
				.concat([
					{
						key: AllVersions,
						label: (
							<div className="flex items-center justify-between space-x-3">
								<p data-all className="text-left">
									All
								</p>
								<Tag hidden={editMode} className="text-right">{stories.length}</Tag>
							</div>
						),
					},
				])
				.concat(
					[
						{
							key: `__ADD_VERSION__`,
							label: (
								<Button color="rgba(0,0,0,0.65)" onClick={() => {
									setIsAddingVersion(true)
									setCurrentVersionId(`__NEW_VERSION__`);
								}
								} disabled={isAddingVersion} style={{ fontSize: `12px` }} size="small">Add Release</Button>
							)
						}
					]
				)
			}
			className="h-full min-w-0 [&>.ant-tabs-nav]:w-full [&_.ant-tabs-tab-btn]:w-full"
		/>
	)
}

export default VersionList
