"use client"

import {doc} from "firebase/firestore"
import {motion} from "framer-motion"
import {useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"

import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import {storyMapScrollPosition} from "./storyMap/utils/globals"
import VersionList from "./storyMap/VersionList"
import {ProductConverter, Products} from "~/types/db/Products"
import {setStoryMapState} from "~/utils/api/mutations"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const Dashboard: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))

	const [currentVersionId, setCurrentVersionId] = useState<Id | `__ALL_VERSIONS__` | undefined>(undefined)
	const [newVesionInputValue, setNewVesionInputValue] = useState<string | undefined>(undefined)

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex flex-col gap-8">
				<StoryMapHeader />

				<div className="relative w-full grow">
					<motion.div
						layoutScroll
						className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2"
						onScroll={(e) => {
							storyMapScrollPosition.current = e.currentTarget.scrollLeft
						}}
					>
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

			<button
				type="button"
				className="fixed bottom-8 right-8 rounded-md border border-laurel px-2 py-1 text-laurel transition-colors hover:border-black hover:text-black"
				onClick={() =>
					void setStoryMapState({
						id: activeProduct!.storyMapStateId,
						data: {productId: activeProduct!.id, epics: [], features: [], stories: []},
					})
				}
			>
				Reset story map
			</button>
		</div>
	)
}

export default Dashboard
