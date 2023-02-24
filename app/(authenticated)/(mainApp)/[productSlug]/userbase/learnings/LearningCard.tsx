import {Button, Card} from "antd"
import {addDoc, collection, deleteDoc, doc, updateDoc} from "firebase/firestore"
import {useForm} from "react-hook-form"

import type {FC} from "react"
import type {z} from "zod"
import type {Id} from "~/types"
import type {Learning} from "~/types/db/Learnings"

import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfStretchyTextArea from "~/components/rhf/RhfStretchyTextArea"
import {LearningSchema} from "~/types/db/Learnings"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const formSchema = LearningSchema.pick({status: true, text: true, title: true})
type FormInputs = z.infer<typeof formSchema>

export type LearningCardProps = {
	learningId?: Id
	initialData: Partial<Learning>
	isEditing: boolean
	onEditStart?: () => void
	onEditEnd: () => void
}

const LearningItemCard: FC<LearningCardProps> = ({learningId, initialData, isEditing, onEditStart, onEditEnd}) => {
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
		if (learningId) await updateDoc(doc(db, `Learnings`, learningId), data satisfies Partial<Learning>)
		else await addDoc(collection(db, `Learnings`), {...data, productId: activeProductId} satisfies Learning)
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
						<Button size="small" type="primary" htmlType="submit" form="learning-form">
							Done
						</Button>
					</div>
				) : (
					<Button type="link" onClick={() => onEditStart?.()}>
						Edit
					</Button>
				)
			}
		>
			{isEditing ? (
				<form
					id="learning-form"
					onSubmit={(e) => {
						onSubmit(e).catch(console.error)
					}}
					className="flex flex-col gap-4"
				>
					<RhfSegmented
						control={control}
						name="status"
						options={[
							{label: `Validated`, value: `validated`},
							{label: `Assumed`, value: `assumed`},
							{label: `Disproven`, value: `disproven`},
						]}
						block
					/>
					<RhfStretchyTextArea control={control} name="text" minHeight="4rem" />
					{learningId && (
						<Button
							danger
							onClick={() => {
								deleteDoc(doc(db, `Learnings`, learningId)).catch(console.error)
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

export default LearningItemCard
