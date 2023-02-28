import {Button, Card, Input, Skeleton, Space} from "antd"
import {useEffect, useState} from "react"

import type {FC} from "react"
import type {Promisable} from "type-fest"

export type FinalStepProps = {
	gptResponse: string | undefined
	onFinish: (finalVision: string) => Promisable<void>
	onCancel: () => void
}

const FinalStep: FC<FinalStepProps> = ({gptResponse, onFinish, onCancel}) => {
	const [visionDraft, setVisionDraft] = useState(gptResponse)
	useEffect(() => {
		setVisionDraft(gptResponse)
	}, [gptResponse])

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex flex-col gap-2">
				<p className="text-lg">Finalize</p>
				<p className="text-sm text-textTertiary">Modify as you see fit</p>
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
				<Button disabled={!gptResponse} onClick={() => onCancel()} className="bg-white">
					Cancel
				</Button>
				<Button
					type="primary"
					disabled={!gptResponse}
					onClick={() => {
						Promise.resolve(onFinish(visionDraft!)).catch(console.error)
					}}
				>
					Save
				</Button>
			</Space>
		</div>
	)
}

export default FinalStep
