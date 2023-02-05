import {Button, Card, Space, Skeleton} from "antd"
import {doc} from "firebase/firestore"
import {useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import {generateProductVision} from "./getGptResponse"
import {ProductConverter, Products} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type ResponseStepProps = {
	gptResponse: string | undefined
	setGptResponse: (newResponse: string) => void
	onFinish: () => void
}

const ResponseStep: FC<ResponseStepProps> = ({gptResponse, setGptResponse, onFinish}) => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))
	const [isRedoing, setIsRedoing] = useState(false)

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="space-y-2">
				<p className="text-xl font-semibold">ChatGPT Response</p>
				<p className="text-sm text-laurel">This is what we got back</p>
			</div>

			<Card
				style={{
					boxShadow: `0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)`,
				}}
			>
				{gptResponse ? <p>{gptResponse}</p> : <Skeleton active />}
			</Card>
			<Space className="flex justify-end">
				<Button
					className="bg-white"
					loading={isRedoing}
					disabled={!gptResponse}
					onClick={async () => {
						if (isRedoing) return
						setIsRedoing(true)
						const newResponse = await generateProductVision({
							productType: activeProduct!.productType,
							valueProposition: activeProduct!.valueProposition,
							features: activeProduct!.features.map((f) => f.text),
						})
						setGptResponse(newResponse)
						setIsRedoing(false)
					}}
				>
					Redo
				</Button>
				<Button type="primary" disabled={!gptResponse} onClick={() => void onFinish()} className="bg-green">
					Accept
				</Button>
			</Space>
		</div>
	)
}

export default ResponseStep
