"use client"

import {Tabs} from "antd"
import {doc} from "firebase/firestore"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import EpicsTab from "./epicsTab/EpicsTab"
import FeaturesTab from "./featuresTab/FeaturesTab"
import {ProductConverter, Products} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const PrioritiesPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))

	if (!activeProduct) return null
	return (
		<div className="h-full">
			<Tabs
				tabPosition="right"
				items={[
					{key: `epics`, label: `Epics`, children: <EpicsTab activeProduct={activeProduct} />},
					{key: `features`, label: `Features`, children: <FeaturesTab activeProduct={activeProduct} />},
				]}
				style={{height: `100%`}}
			/>
		</div>
	)
}

export default PrioritiesPage
