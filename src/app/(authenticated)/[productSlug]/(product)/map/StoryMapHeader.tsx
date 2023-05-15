import { CheckOutlined, CloseOutlined, EditOutlined, PlusOutlined, RedoOutlined, RobotOutlined, UndoOutlined } from "@ant-design/icons"
import { Breadcrumb, Button, Divider, Tooltip } from "antd"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Timestamp, collection, doc, getDocs, orderBy, query, runTransaction, serverTimestamp, writeBatch } from "firebase/firestore"
import produce from "immer"
import { nanoid } from "nanoid"
import { useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import { useInterval } from "react-use"

import type { Dayjs } from "dayjs"
import type { FC } from "react"
import type { HistoryItem } from "~/types/db/Products/StoryMapHistories/HistoryItems";
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems";

import { useStoryMapContext } from "./StoryMapContext"
import { useAppContext } from "../../AppContext"
import { StoryMapHistoryConverter } from "~/types/db/Products/StoryMapHistories"
import { HistoryItemConverter } from "~/types/db/Products/StoryMapHistories/HistoryItems"
import { StoryMapItemConverter } from "~/types/db/Products/StoryMapItems"
import { VersionConverter } from "~/types/db/Products/Versions"
import { db } from "~/utils/firebase"


dayjs.extend(relativeTime)

export type StoryMapHeaderProps = {
	versionName?: string
	lastUpdated: Dayjs | undefined
}

const StoryMapHeader: FC<StoryMapHeaderProps> = ({ versionName, lastUpdated }) => {
	const { product } = useAppContext()
	const {
		versions,
		currentVersionId,
		setCurrentVersionId,
		newVersionInputValue,
		setNewVersionInputValue,
		storyMapItems,
		editMode,
		setEditMode,
		versionsToBeDeleted,
		setVersionsToBeDeleted,
		itemsToBeDeleted,
		setItemsToBeDeleted
	} = useStoryMapContext()

	const [histories, , historiesError] = useCollection(
		query(
			collection(product.ref, `StoryMapHistories`).withConverter(StoryMapHistoryConverter),
			orderBy(`timestamp`, `desc`),
		),
	)
	useErrorHandler(historiesError)

	const lastHistory =
		product.exists() &&
		histories?.docs.find(
			(history) => history.data().future === false && history.id !== product.data().storyMapCurrentHistoryId,
		)
	const currentHistory =
		product.exists() && histories?.docs.find((history) => history.id === product.data().storyMapCurrentHistoryId)
	const nextHistory = histories?.docs.findLast((history) => history.data().future === true)

	const undo = async () => {
		if (!histories || !lastHistory || !currentHistory) return

		await runTransaction(db, async (transaction) => {
			const currentHistoryItems = await getDocs(
				collection(product.ref, `StoryMapHistories`, currentHistory.id, `HistoryItems`).withConverter(
					HistoryItemConverter,
				),
			)
			const lastHistoryItems = await getDocs(
				collection(product.ref, `StoryMapHistories`, lastHistory.id, `HistoryItems`).withConverter(
					HistoryItemConverter,
				),
			)

			lastHistoryItems.docs.forEach((historyItem) => {
				const dataWithoutNull = produce(historyItem.data(), (draft) => {
					for (const key in draft) {
						if (draft[key as keyof HistoryItem] === null) delete draft[key as keyof HistoryItem]
					}
				}) as StoryMapItem
				transaction.update(doc(product.ref, `StoryMapItems`, historyItem.id).withConverter(StoryMapItemConverter), {
					...dataWithoutNull,
					updatedAt: serverTimestamp(),
				})
			})

			const itemsToDelete = currentHistoryItems.docs
				.filter((item) => !item.data().deleted)
				.filter(
					(currentHistoryItem) =>
						!lastHistoryItems.docs
							.filter((item) => !item.data().deleted)
							.some((item) => item.id === currentHistoryItem.id),
				)
			itemsToDelete.forEach((item) => {
				transaction.update(doc(product.ref, `StoryMapItems`, item.id).withConverter(StoryMapItemConverter), {
					deleted: true,
					updatedAt: Timestamp.now(),
				})
			})

			transaction.update(currentHistory.ref, {
				future: true,
			})
			transaction.update(product.ref, {
				storyMapCurrentHistoryId: lastHistory.id,
			})
		})
	}

	const redo = async () => {
		if (!histories || !nextHistory) return

		await runTransaction(db, async (transaction) => {
			const nextHistoryItems = await getDocs(
				collection(product.ref, `StoryMapHistories`, nextHistory.id, `HistoryItems`).withConverter(
					HistoryItemConverter,
				),
			)

			nextHistoryItems.docs.forEach((historyItem) => {
				const dataWithoutNull = produce(historyItem.data(), (draft) => {
					for (const key in draft) {
						if (draft[key as keyof HistoryItem] === null) delete draft[key as keyof HistoryItem]
					}
				}) as StoryMapItem
				transaction.update(doc(product.ref, `StoryMapItems`, historyItem.id).withConverter(StoryMapItemConverter), {
					...dataWithoutNull,
					updatedAt: serverTimestamp(),
				})
			})

			transaction.update(nextHistory.ref, {
				future: false,
			})
			transaction.update(product.ref, {
				storyMapCurrentHistoryId: nextHistory.id,
			})
		})
	}

	const canRedo = histories?.docs.findLast((history) => history.data().future === true)
	const canUndo =
		product.exists() &&
		histories?.docs.find(
			(history) => history.data().future === false && history.id !== product.data().storyMapCurrentHistoryId,
		)

	const deleteItems = async () => {
		if (!storyMapItems || !versions || (itemsToBeDeleted.length === 0 && versionsToBeDeleted.length === 0)) {
			setEditMode(false)
			return
		}
		const batch = writeBatch(db)

		itemsToBeDeleted.forEach((id) => {
			batch.update(doc(product.ref, `StoryMapItems`, id).withConverter(StoryMapItemConverter), {
				deleted: true,
			})
		})
		versionsToBeDeleted.forEach((id) => {
			batch.update(doc(product.ref, `Versions`, id).withConverter(VersionConverter), {
				deleted: true,
			})
		})

		// Add a story map history entry
		const historyId = nanoid()
		batch.set(doc(product.ref, `StoryMapHistories`, historyId).withConverter(StoryMapHistoryConverter), {
			future: false,
			timestamp: serverTimestamp(),
		})
		storyMapItems.forEach((item) => {
			batch.set(
				doc(product.ref, `StoryMapHistories`, historyId, `HistoryItems`, item.id).withConverter(HistoryItemConverter),
				item,
			)
		})
		batch.update(product.ref, {
			storyMapCurrentHistoryId: historyId,
		})

		await batch.commit()
		setEditMode(false)
		setItemsToBeDeleted([])
		setVersionsToBeDeleted([])
	}

	const [lastUpdatedText, setLastUpdatedText] = useState<string | undefined>(undefined)
	useInterval(() => {
		if (lastUpdated !== undefined) setLastUpdatedText(lastUpdated.fromNow())
	}, 1000)

	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between gap-4 px-12 pt-8">
				<Breadcrumb items={[{ title: `Story Map` }, { title: versionName ?? `All` }]} />
				{/* {lastUpdatedText && <p className="text-sm italic text-textTertiary">Last updated {lastUpdatedText}</p>} */}
				<div>
					<div className="flex gap-2 items-center">

						<Button disabled
							//disabled={scrumGenieRunning} onClick={sgGenUserStory}
							className="flex items-center justify-center" icon={<RobotOutlined />}></Button>
						<Divider type="vertical" style={{ height: `20px`, border: `1px solid rgba(0, 0, 0, 0.15);` }} />
						<Tooltip placement="bottom" title="Redo">
							<Button
								icon={<RedoOutlined className={clsx(`transition-colors`, !canRedo && `text-textTertiary`)} />}
								className={clsx(!canRedo && `cursor-default `, `flex items-center justify-center`)}
								onClick={() => {
									redo().catch(console.error)
								}}
							//disabled={editMode}
							/>
						</Tooltip>
						<Tooltip placement="bottom" title="Undo">
							<Button
								icon={<UndoOutlined className={clsx(`transition-colors`, !canUndo && `text-textTertiary`)} />}
								className={clsx(!canUndo && `cursor-default`, `flex items-center justify-center`)}
								onClick={() => {
									undo().catch(console.error)
								}}
							/>
						</Tooltip>
						{!editMode ? (<Tooltip placement="bottom" title="Edit">
							<Button className="flex items-center justify-center" icon={<EditOutlined />} onClick={() => setEditMode(true)} />
						</Tooltip>) :
							(<>
								<Tooltip placement="bottom" title="Save">
									<Button
										className="flex items-center justify-center"
										icon={<CheckOutlined />}
										type="primary"
										onClick={() => {
											deleteItems().catch(console.error)
										}}
									/>
								</Tooltip><Tooltip placement="bottom" title="Cancel">
									<Button
										className="flex items-center justify-center"
										icon={<CloseOutlined />}
										onClick={() => {
											setEditMode(false)
											setItemsToBeDeleted([])
											setVersionsToBeDeleted([])
										}}
									/>
								</Tooltip></>)}
					</div>
				</div>
			</div>
			<div className="px-12 text-[#595959]">
				<div className="relative h-3 w-full">
					<svg viewBox="-16 -12 132 124" preserveAspectRatio="none" className="absolute top-0 left-0 h-full w-2">
						<path
							d="M 100 0 L 0 50 L 100 100"
							vectorEffect="non-scaling-stroke"
							className="fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
						/>
					</svg>
					<svg className="absolute top-0 left-0.5 h-full w-[calc(100%-4px)]">
						<line x1="0%" y1="50%" x2="100%" y2="50%" className="stroke-current stroke-[1.5] [stroke-dasharray:6_2]" />
					</svg>
					<svg viewBox="-16 -12 132 124" preserveAspectRatio="none" className="absolute right-0 top-0 h-full w-2">
						<path
							d="M 0 0 L 100 50 L 0 100"
							vectorEffect="non-scaling-stroke"
							className="fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
						/>
					</svg>
				</div>
				<div className="mt-2 flex justify-between text-sm">
					<p>Highest value</p>
					<p>Lowest value</p>
				</div>
			</div>
		</div>
	)
}

export default StoryMapHeader
