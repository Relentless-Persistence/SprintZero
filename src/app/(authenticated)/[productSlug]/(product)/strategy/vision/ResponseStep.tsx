import {Button, Card, Skeleton, Space} from "antd"
import {doc} from "firebase/firestore"
import {useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import {generateProductVision} from "./getGptResponse"
import {ProductConverter} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type ResponseStepProps = {
	gptResponse: string | undefined
	setGptResponse: (newResponse: string) => void
	onFinish: () => void
}

const ResponseStep: FC<ResponseStepProps> = ({gptResponse, setGptResponse, onFinish}) => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
	const [isRedoing, setIsRedoing] = useState(false)

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex flex-col gap-2">
				<p className="text-xl font-semibold">GPT-3 Response</p>
				<p className="text-sm text-textTertiary">This is what we got back</p>
			</div>

			<Card>{gptResponse ? <p>{gptResponse}</p> : <Skeleton active />}</Card>
			<Space className="flex justify-end">
				<Button
					className="bg-white"
					loading={isRedoing}
					disabled={!gptResponse}
					onClick={() => {
						if (isRedoing) return
						setIsRedoing(true)
						generateProductVision({
							productType: activeProduct!.productType,
							valueProposition: activeProduct!.valueProposition,
							features: activeProduct!.features.map((f) => f.text),
						})
							.then((newResponse) => {
								setGptResponse(newResponse)
								setIsRedoing(false)
							})
							.catch(console.error)
					}}
				>
					Redo
				</Button>
				<Button type="primary" disabled={!gptResponse} onClick={() => onFinish()}>
					Accept
				</Button>
			</Space>
		</div>
	)
}

export default ResponseStep
