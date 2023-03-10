"use client"

import {PlusOutlined} from "@ant-design/icons"
import {Breadcrumb, FloatButton, Tabs} from "antd"
import {collection} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"

import InsightItemCard from "./InsightCard"
import {useAppContext} from "~/app/(authenticated)/AppContext"
import {InsightConverter} from "~/types/db/Products/Insights"

const InsightsClientPage: FC = () => {
	const {product} = useAppContext()
	const [currentTab, setCurrentTab] = useState<keyof typeof tabNames>(`validated`)

	const [insights] = useCollection(collection(product.ref, `Insights`).withConverter(InsightConverter))
	const [activeInsight, setActiveInsight] = useState<string | `new` | undefined>(undefined)

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="relative flex h-full flex-col gap-6 overflow-auto px-12 py-8">
				<Breadcrumb>
					<Breadcrumb.Item>Userbase</Breadcrumb.Item>
					<Breadcrumb.Item>Insights</Breadcrumb.Item>
					<Breadcrumb.Item>{tabNames[currentTab]}</Breadcrumb.Item>
				</Breadcrumb>

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
								insightId={insight.id}
								initialData={insight.data()}
								isEditing={activeInsight === insight.id}
								onEditStart={() => setActiveInsight(insight.id)}
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

				<FloatButton
					icon={<PlusOutlined />}
					className="absolute bottom-8 right-12 text-primary"
					onClick={() => setActiveInsight(`new`)}
				/>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentTab}
				onChange={(key: keyof typeof tabNames) => setCurrentTab(key)}
				items={Object.entries(tabNames).map(([key, label]) => ({key, label}))}
				className="h-full"
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
