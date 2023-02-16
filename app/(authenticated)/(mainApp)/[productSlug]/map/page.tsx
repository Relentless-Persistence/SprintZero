"use client"

import {MenuOutlined, PlusOutlined} from "@ant-design/icons"
import {FloatButton} from "antd"
import {collection, doc} from "firebase/firestore"
import {motion} from "framer-motion"
import {useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"

import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import VersionList from "./storyMap/VersionList"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const StoryMapPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const [storyMapState] = useDocument(
		activeProduct?.exists()
			? doc(db, `StoryMapStates`, activeProduct.data().storyMapStateId).withConverter(StoryMapStateConverter)
			: undefined,
	)

	const [currentVersionId, setCurrentVersionId] = useState<Id | `__ALL_VERSIONS__` | undefined>(undefined)
	const [newVesionInputValue, setNewVesionInputValue] = useState<string | undefined>(undefined)

	const [versions] = useCollection(
		activeProduct?.exists()
			? collection(db, `StoryMapStates`, activeProduct.data().storyMapStateId, `Versions`).withConverter(
					VersionConverter,
			  )
			: undefined,
	)

	return (
		<div className="grid h-full grid-cols-[1fr_fit-content(6rem)]">
			<div className="relative flex flex-col gap-8">
				{currentVersionId && (
					<StoryMapHeader
						versionName={versions?.docs.find((version) => version.id === currentVersionId)?.data().name}
					/>
				)}

				<div className="relative w-full grow">
					<motion.div layoutScroll className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2">
						{activeProduct?.exists() && storyMapState?.exists() && currentVersionId !== undefined && versions && (
							<StoryMap
								activeProduct={activeProduct}
								storyMapState={storyMapState}
								allVersions={versions}
								currentVersionId={currentVersionId}
							/>
						)}
					</motion.div>
				</div>

				<FloatButton.Group
					trigger="click"
					type="primary"
					shape="square"
					icon={<MenuOutlined />}
					className="absolute right-12 bottom-8"
				>
					<FloatButton icon={<PlusOutlined />} onClick={() => setNewVesionInputValue(``)} />
				</FloatButton.Group>
			</div>

			{activeProduct?.exists() && versions && (
				<VersionList
					allVersions={versions}
					currentVersionId={currentVersionId}
					setCurrentVersionId={setCurrentVersionId}
					newVersionInputValue={newVesionInputValue}
					setNewVersionInputValue={setNewVesionInputValue}
					storyMapStateId={activeProduct.data().storyMapStateId}
				/>
			)}
		</div>
	)
}

export default StoryMapPage
