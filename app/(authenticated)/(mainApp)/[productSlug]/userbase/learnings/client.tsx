"use client"

import {Breadcrumb, Button, Tabs} from "antd"
import {collection, query, where} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"

import LearningItemCard from "./LearningCard"
import {LearningConverter} from "~/types/db/Learnings"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const LearningsClientPage: FC = () => {
	const [currentTab, setCurrentTab] = useState<keyof typeof tabNames>(`validated`)

	const activeProductId = useActiveProductId()
	const [learnings] = useCollection(
		query(collection(db, `Learnings`), where(`productId`, `==`, activeProductId)).withConverter(LearningConverter),
	)
	const [activeLearning, setActiveLearning] = useState<Id | `new` | undefined>(undefined)

	return (
		<div className="grid grid-cols-[1fr_max-content]">
			<div className="flex flex-col gap-6 overflow-auto px-12 py-8">
				<div className="flex justify-between">
					<Breadcrumb>
						<Breadcrumb.Item>Userbase</Breadcrumb.Item>
						<Breadcrumb.Item>Learnings</Breadcrumb.Item>
						<Breadcrumb.Item>{tabNames[currentTab]}</Breadcrumb.Item>
					</Breadcrumb>

					<Button onClick={() => setActiveLearning(`new`)}>Add New</Button>
				</div>

				<Masonry
					breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
					className="flex gap-8"
					columnClassName="bg-clip-padding flex flex-col gap-8"
				>
					{learnings?.docs
						.filter((learning) => learning.data().status === currentTab)
						.map((learning) => (
							<LearningItemCard
								key={learning.id}
								learningId={learning.id as Id}
								initialData={learning.data()}
								isEditing={activeLearning === learning.id}
								onEditStart={() => setActiveLearning(learning.id as Id)}
								onEditEnd={() => setActiveLearning(undefined)}
							/>
						))}

					{activeLearning === `new` && (
						<LearningItemCard
							initialData={{status: currentTab}}
							isEditing
							onEditEnd={() => setActiveLearning(undefined)}
						/>
					)}
				</Masonry>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentTab}
				onChange={(key: keyof typeof tabNames) => setCurrentTab(key)}
				items={Object.entries(tabNames).map(([key, label]) => ({key, label}))}
			/>
		</div>
	)
}

export default LearningsClientPage

const tabNames = {
	validated: `Validated`,
	assumed: `Assumed`,
	disproven: `Disproven`,
} as const
