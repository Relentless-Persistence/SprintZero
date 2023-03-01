import {DislikeOutlined, LikeOutlined, QuestionCircleOutlined} from "@ant-design/icons"
import {Button, Card} from "antd"
import {addDoc, collection, deleteDoc, doc, updateDoc} from "firebase/firestore"
import {useForm} from "react-hook-form"

import type {FC} from "react"
import type {z} from "zod"
import type {Id} from "~/types"
import type {Insight} from "~/types/db/Insights"

import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfStretchyTextArea from "~/components/rhf/RhfStretchyTextArea"
import {InsightSchema} from "~/types/db/Insights"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const formSchema = InsightSchema.pick({status: true, text: true, title: true})
type FormInputs = z.infer<typeof formSchema>

export type InsightCardProps = {
	insightId?: Id
	initialData: Partial<Insight>
	isEditing: boolean
	onEditStart?: () => void
	onEditEnd: () => void
}

const InsightItemCard: FC<InsightCardProps> = ({insightId, initialData, isEditing, onEditStart, onEditEnd}) => {
	const {control, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: {
			status: initialData.status,
			text: initialData.text ?? ``,
			title: initialData.title ?? ``,
		},
	})

	const activeProductId = useActiveProductId()
	const onSubmit = handleSubmit(async (data) => {
		if (insightId) await updateDoc(doc(db, `Insights`, insightId), data satisfies Partial<Insight>)
		else await addDoc(collection(db, `Insights`), {...data, productId: activeProductId} satisfies Insight)
		onEditEnd()
	})

	return (
		<Card
			type="inner"
			title={isEditing ? <RhfInput size="small" control={control} name="title" className="mr-4" /> : initialData.title}
			extra={
				isEditing ? (
					<div className="ml-4 flex gap-2">
						<Button size="small" onClick={() => onEditEnd()}>
							Cancel
						</Button>
						<Button size="small" type="primary" htmlType="submit" form="insight-form">
							Done
						</Button>
					</div>
				) : (
					<Button type="text" onClick={() => onEditStart?.()}>
						Edit
					</Button>
				)
			}
		>
			{isEditing ? (
				<form
					id="insight-form"
					onSubmit={(e) => {
						onSubmit(e).catch(console.error)
					}}
					className="flex flex-col gap-4"
				>
					<RhfStretchyTextArea control={control} name="text" minHeight="4rem" />
					<RhfSegmented
						control={control}
						name="status"
						options={[
							{label: `Validated`, value: `validated`, icon: <LikeOutlined />},
							{label: `Assumed`, value: `assumed`, icon: <QuestionCircleOutlined />},
							{label: `Disproven`, value: `disproven`, icon: <DislikeOutlined />},
						]}
						block
					/>
					{insightId && (
						<Button
							danger
							onClick={() => {
								deleteDoc(doc(db, `Insights`, insightId)).catch(console.error)
							}}
							className="w-full"
						>
							Remove
						</Button>
					)}
				</form>
			) : (
				<p className="min-w-0">{initialData.text}</p>
			)}
		</Card>
	)
}

export default InsightItemCard
