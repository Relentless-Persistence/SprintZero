"use client"

import {Tabs} from "antd5"

import type {FC} from "react"

import EpicsTab from "./epicsTab/EpicsTab"
import FeaturesTab from "./featuresTab/FeaturesTab"

const PrioritiesPage: FC = () => {
	return (
		<div className="h-full">
			<Tabs
				tabPosition="right"
				items={[
					{key: `epics`, label: `Epics`, children: <EpicsTab />},
					{key: `features`, label: `Features`, children: <FeaturesTab />},
				]}
				style={{height: `100%`}}
			/>
		</div>
	)
}

export default PrioritiesPage
