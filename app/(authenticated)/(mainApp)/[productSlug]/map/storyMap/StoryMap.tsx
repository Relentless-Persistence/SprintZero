import {ReadOutlined} from "@ant-design/icons"
import {doc} from "firebase/firestore"
import {useDocumentData} from "react-firebase-hooks/firestore"
import invariant from "tiny-invariant"

import type {FC} from "react"
import type {Id, WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"

import Epic from "./Epic"
import {genMeta} from "./utils/meta"
import {StoryMapStateConverter, StoryMapStates} from "~/types/db/StoryMapStates"
import {db} from "~/utils/firebase"

export type StoryMapProps = {
	activeProduct: WithDocumentData<Product>
	currentVersionId: Id | `__ALL_VERSIONS__`
}

const StoryMap: FC<StoryMapProps> = ({activeProduct, currentVersionId}) => {
	const [storyMapState] = useDocumentData(
		doc(db, StoryMapStates._, activeProduct.storyMapStateId).withConverter(StoryMapStateConverter),
		{
			initialValue: {
				id: activeProduct.storyMapStateId,
				items: {},
				productId: activeProduct.id,
				ref: doc(db, StoryMapStates._, activeProduct.storyMapStateId).withConverter(StoryMapStateConverter),
			},
		},
	)
	invariant(storyMapState, `storyMapState must exist`)

	const meta = genMeta(storyMapState, currentVersionId)

	return (
		<>
			<div className="relative z-10 flex w-max items-start gap-8">
				{meta.epics.map((epic) => (
					<Epic key={epic.id} meta={meta} currentVersionId={currentVersionId} epicId={epic.id} />
				))}

				<button
					type="button"
					onClick={() => {
						meta.addEpic({}).catch(console.error)
					}}
					className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#4f2dc8] transition-colors hover:bg-[#faf8ff]"
					data-testid="add-epic"
				>
					<ReadOutlined />
					<span>Add epic</span>
				</button>
			</div>

			{/* {dragState.current && (
				<motion.div id="drag-host" className="fixed top-0 left-0 z-20" style={dragHostStyle}>
					{storyMapState &&
						(() => {
							for (const epic of storyMapState.epics) {
								if (epic.id === dragState.current.id)
									return (
										<Epic
											activeProduct={activeProduct}
											storyMapState={storyMapState}
											currentVersionId={currentVersionId}
											epicId={epic.id}
											inert
										/>
									)
							}

							for (const feature of storyMapState.features) {
								if (feature.id === dragState.current.id)
									return (
										<Feature
											activeProduct={activeProduct}
											storyMapState={storyMapState}
											currentVersionId={currentVersionId}
											featureId={feature.id}
											inert
										/>
									)
							}

							for (const story of storyMapState.stories) {
								if (story.id === dragState.current.id)
									return <Story activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} inert />
							}
						})()}
				</motion.div>
			)} */}
		</>
	)
}

export default StoryMap
