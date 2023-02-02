"use client"

import {Breadcrumb} from "antd"
import {doc} from "firebase/firestore"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import SprintBoard from "./SprintBoard"
import {ProductConverter, Products} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const SprintPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))

	return (
		<div className="flex h-full flex-col gap-6">
			<div className="mx-12 mt-8">
				<Breadcrumb>
					<Breadcrumb.Item>Operations</Breadcrumb.Item>
					<Breadcrumb.Item>Sprint</Breadcrumb.Item>
				</Breadcrumb>
			</div>
			{activeProduct && (
				<div className="flex w-full grow overflow-x-auto pl-12 pb-8">
					<SprintBoard activeProduct={activeProduct} />

					{/* Spacer because padding doesn't work in the overflow */}
					<div className="shrink-0 basis-12" />
				</div>
			)}
		</div>
	)
}

export default SprintPage
