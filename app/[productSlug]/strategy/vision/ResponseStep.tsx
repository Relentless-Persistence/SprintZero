import {Button, Card, Space, Skeleton} from "antd5"
import {useAtomValue} from "jotai"
import {useState} from "react"

import type {FC} from "react"

import {generateProductVision} from "./getGptResponse"
import {activeProductAtom} from "~/utils/atoms"

export type ResponseStepProps = {
	gptResponse: string | undefined
	setGptResponse: (newResponse: string) => void
	onFinish: () => void
}

const ResponseStep: FC<ResponseStepProps> = ({gptResponse, setGptResponse, onFinish}) => {
	const activeProduct = useAtomValue(activeProductAtom)
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
				<Button type="primary" disabled={!gptResponse} onClick={() => void onFinish()} className="bg-green-s500">
					Accept
				</Button>
			</Space>
		</div>
	)
}

export default ResponseStep
