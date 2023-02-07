import {Button, Card} from "antd"
import {deleteDoc, doc, updateDoc} from "firebase/firestore"
import {useForm} from "react-hook-form"

import type {FC} from "react"
import type {z} from "zod"
import type {WithDocumentData} from "~/types"
import type {AccessibilityItem} from "~/types/db/AccessibilityItems"

import RhfInput from "~/components/rhf/RhfInput"
import RhfStretchyTextArea from "~/components/rhf/RhfStretchyTextArea"
import {AccessibilityItems, AccessibilityItemSchema} from "~/types/db/AccessibilityItems"
import {db} from "~/utils/firebase"

const formSchema = AccessibilityItemSchema.pick({name: true, text: true, type: true})
type FormInputs = z.infer<typeof formSchema>

export type AccessibilityItemCardProps = {
	item: WithDocumentData<AccessibilityItem>
	isEditing: boolean
	onEditStart: () => void
	onEditEnd: () => void
}

const AccessibilityItemCard: FC<AccessibilityItemCardProps> = ({item, isEditing, onEditStart, onEditEnd}) => {
	const {control, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: {
			name: item.name,
			text: item.text,
			type: item.type,
		},
	})

	const onSubmit = handleSubmit(async (data) => {
		await updateDoc(doc(db, AccessibilityItems._, item.id), data)
	})

	return (
		<Card
			type="inner"
			title={isEditing ? <RhfInput size="small" control={control} name="name" className="mr-4" /> : item.name}
			extra={
				isEditing ? (
					<div className="ml-4 flex gap-2">
						<Button size="small" onClick={() => void onEditEnd()}>
							Cancel
						</Button>
						<Button size="small" type="primary" htmlType="submit" form="accessibility-item-form">
							Done
						</Button>
					</div>
				) : (
					<button type="button" onClick={() => void onEditStart()} className="text-green">
						Edit
					</button>
				)
			}
		>
			{isEditing ? (
				<form id="accessibility-item-form" onSubmit={onSubmit} className="space-y-2">
					<RhfStretchyTextArea control={control} name="text" />
					<Button
						danger
						onClick={async () => void (await deleteDoc(doc(db, AccessibilityItems._, item.id)))}
						className="w-full"
					>
						Remove
					</Button>
				</form>
			) : (
				<p className="min-w-0">{item.text}</p>
			)}
		</Card>
	)
}

export default AccessibilityItemCard
