import {Button, Card} from "antd"
import {addDoc, collection, deleteDoc, doc, updateDoc} from "firebase/firestore"
import {useForm} from "react-hook-form"

import type {FC} from "react"
import type {z} from "zod"
import type {WithDocumentData} from "~/types"
import type {Learning} from "~/types/db/Learnings"

import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfStretchyTextArea from "~/components/rhf/RhfStretchyTextArea"
import {Learnings, LearningSchema} from "~/types/db/Learnings"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const formSchema = LearningSchema.pick({status: true, text: true, title: true})
type FormInputs = z.infer<typeof formSchema>

export type LearningCardProps = {
	item: Partial<WithDocumentData<Learning>>
	isEditing: boolean
	onEditStart?: () => void
	onEditEnd: () => void
}

const LearningItemCard: FC<LearningCardProps> = ({item, isEditing, onEditStart, onEditEnd}) => {
	const {control, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: {
			status: item.status,
			text: item.text ?? ``,
			title: item.title ?? ``,
		},
	})

	const activeProductId = useActiveProductId()
	const onSubmit = handleSubmit(async (data) => {
		if (item.id) await updateDoc(doc(db, Learnings._, item.id), data satisfies Partial<Learning>)
		else await addDoc(collection(db, Learnings._), {...data, productId: activeProductId} satisfies Learning)
		onEditEnd()
	})

	return (
		<Card
			type="inner"
			title={isEditing ? <RhfInput size="small" control={control} name="title" className="mr-4" /> : item.title}
			extra={
				isEditing ? (
					<div className="ml-4 flex gap-2">
						<Button size="small" onClick={() => void onEditEnd()}>
							Cancel
						</Button>
						<Button size="small" type="primary" htmlType="submit" form="learning-form">
							Done
						</Button>
					</div>
				) : (
					<button type="button" onClick={() => void onEditStart?.()} className="text-green">
						Edit
					</button>
				)
			}
		>
			{isEditing ? (
				<form id="learning-form" onSubmit={onSubmit} className="flex flex-col gap-4">
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
					{item.id && (
						<Button
							danger
							onClick={async () => void (await deleteDoc(doc(db, Learnings._, item.id!)))}
							className="w-full"
						>
							Remove
						</Button>
					)}
				</form>
			) : (
				<p className="min-w-0">{item.text}</p>
			)}
		</Card>
	)
}

export default LearningItemCard
