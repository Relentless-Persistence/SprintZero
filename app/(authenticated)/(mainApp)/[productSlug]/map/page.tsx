"use client"

import {MenuOutlined, PlusOutlined, RedoOutlined, UndoOutlined} from "@ant-design/icons"
import {FloatButton} from "antd"
import {collection, doc} from "firebase/firestore"
import {motion} from "framer-motion"
import {useState} from "react"
import {useCollectionData, useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"

import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import VersionList from "./storyMap/VersionList"
import {ProductConverter} from "~/types/db/Products"
import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const Dashboard: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const [currentVersionId, setCurrentVersionId] = useState<Id | `__ALL_VERSIONS__` | undefined>(undefined)
	const [newVesionInputValue, setNewVesionInputValue] = useState<string | undefined>(undefined)

	const [versions] = useCollectionData(
		activeProduct
			? collection(db, `StoryMapStates`, activeProduct.storyMapStateId, `Versions`).withConverter(VersionConverter)
			: undefined,
	)

	return (
		<div className="grid h-full grid-cols-[1fr_6rem]">
			<div className="flex flex-col gap-8">
				{currentVersionId && (
					<StoryMapHeader versionName={versions?.find((version) => version.id === currentVersionId)?.name} />
				)}

				<div className="relative w-full grow">
					<motion.div layoutScroll className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2">
						{activeProduct !== undefined && currentVersionId !== undefined && (
							<StoryMap activeProduct={activeProduct} currentVersionId={currentVersionId} />
						)}
					</motion.div>
				</div>
			</div>

			{activeProduct && (
				<VersionList
					currentVersionId={currentVersionId}
					setCurrentVersionId={setCurrentVersionId}
					newVersionInputValue={newVesionInputValue}
					setNewVersionInputValue={setNewVesionInputValue}
					storyMapStateId={activeProduct.storyMapStateId}
				/>
			)}

			<FloatButton.Group
				trigger="click"
				type="primary"
				shape="square"
				icon={<MenuOutlined />}
				className="right-36 bottom-8"
			>
				<FloatButton icon={<RedoOutlined />} />
				<FloatButton icon={<UndoOutlined />} />
				<FloatButton icon={<PlusOutlined />} onClick={() => setNewVesionInputValue(``)} />
			</FloatButton.Group>
		</div>
	)
}

export default Dashboard
