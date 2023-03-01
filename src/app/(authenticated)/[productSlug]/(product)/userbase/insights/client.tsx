"use client"

import {Breadcrumb, Button, Tabs} from "antd"
import {collection, query, where} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"

import InsightItemCard from "./InsightCard"
import {InsightConverter} from "~/types/db/Insights"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const InsightsClientPage: FC = () => {
	const [currentTab, setCurrentTab] = useState<keyof typeof tabNames>(`validated`)

	const activeProductId = useActiveProductId()
	const [insights] = useCollection(
		query(collection(db, `Insights`), where(`productId`, `==`, activeProductId)).withConverter(InsightConverter),
	)
	const [activeInsight, setActiveInsight] = useState<Id | `new` | undefined>(undefined)

	return (
		<div className="grid grid-cols-[1fr_max-content]">
			<div className="flex flex-col gap-6 overflow-auto px-12 py-8">
				<div className="flex justify-between">
					<Breadcrumb>
						<Breadcrumb.Item>Userbase</Breadcrumb.Item>
						<Breadcrumb.Item>Insights</Breadcrumb.Item>
						<Breadcrumb.Item>{tabNames[currentTab]}</Breadcrumb.Item>
					</Breadcrumb>

					<Button onClick={() => setActiveInsight(`new`)}>Add New</Button>
				</div>

				<Masonry
					breakpointCols={{default: 4, 1700: 3, 1300: 2, 1000: 1}}
					className="flex gap-8"
					columnClassName="flex flex-col gap-8"
				>
					{insights?.docs
						.filter((insight) => insight.data().status === currentTab)
						.map((insight) => (
							<InsightItemCard
								key={insight.id}
								insightId={insight.id as Id}
								initialData={insight.data()}
								isEditing={activeInsight === insight.id}
								onEditStart={() => setActiveInsight(insight.id as Id)}
								onEditEnd={() => setActiveInsight(undefined)}
							/>
						))}

					{activeInsight === `new` && (
						<InsightItemCard
							initialData={{status: currentTab}}
							isEditing
							onEditEnd={() => setActiveInsight(undefined)}
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

export default InsightsClientPage

const tabNames = {
	validated: `Validated`,
	assumed: `Assumed`,
	disproven: `Disproven`,
} as const
