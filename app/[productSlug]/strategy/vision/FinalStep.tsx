import {Button, Card, Input, Skeleton, Space} from "antd5"
import {useEffect, useState} from "react"

import type {FC} from "react"

export type FinalStepProps = {
	gptResponse: string | undefined
	onFinish: (finalVision: string) => void
	onCancel: () => void
}

const FinalStep: FC<FinalStepProps> = ({gptResponse, onFinish, onCancel}) => {
	const [visionDraft, setVisionDraft] = useState(gptResponse)
	useEffect(() => {
		setVisionDraft(gptResponse)
	}, [gptResponse])

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="space-y-2">
				<p className="text-[16px]">Finalize</p>
				<p className="text-sm text-black/[0.45]">Modify as you see fit</p>
			</div>

			<Card
				style={{
					boxShadow: `0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)`,
				}}
			>
				{gptResponse ? (
					<Input.TextArea rows={12} value={visionDraft} onChange={(e) => setVisionDraft(e.target.value)} />
				) : (
					<Skeleton active />
				)}
			</Card>
			<Space className="flex justify-end">
				<Button disabled={!gptResponse} onClick={() => void onCancel()} className="bg-white">
					Cancel
				</Button>
				<Button
					type="primary"
					disabled={!gptResponse}
					onClick={() => void onFinish(visionDraft!)}
					className="bg-green-s500"
				>
					Save
				</Button>
			</Space>
		</div>
	)
}

export default FinalStep
