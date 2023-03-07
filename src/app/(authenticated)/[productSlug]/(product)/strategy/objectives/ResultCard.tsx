import {zodResolver} from "@hookform/resolvers/zod"
import {Button, Card, Form} from "antd"
import {Timestamp, addDoc, collection, deleteDoc, updateDoc} from "firebase/firestore"
import {useForm} from "react-hook-form"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {z} from "zod"
import type {Id} from "~/types"
import type {Result} from "~/types/db/Results"

import RhfStretchyTextArea from "~/components/rhf/RhfStretchyTextArea"
import {ResultConverter, ResultSchema} from "~/types/db/Results"
import {db} from "~/utils/firebase"
import {formValidateStatus} from "~/utils/formValidateStatus"

const formSchema = ResultSchema.pick({text: true})
type FormInputs = z.infer<typeof formSchema>

export type ResultCardProps = {
	objectiveId: Id
	result?: QueryDocumentSnapshot<Result>
	index?: number
	isEditing: boolean
	onEditStart?: () => void
	onEditEnd: () => void
}

const ResultCard: FC<ResultCardProps> = ({objectiveId, result, index, isEditing, onEditStart, onEditEnd}) => {
	const {control, handleSubmit, getFieldState, formState} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			text: result?.data().text ?? ``,
		},
	})

	const onSubmit = handleSubmit(async (data) => {
		onEditEnd()
		if (result) {
			await updateDoc(result.ref, {
				text: data.text,
			})
		} else {
			await addDoc(collection(db, `Objectives`, objectiveId, `Results`).withConverter(ResultConverter), {
				createdAt: Timestamp.now(),
				text: data.text,
			})
		}
	})

	return (
		<Card
			title={
				isEditing ? (
					result?.exists() ? (
						<Button
							type="primary"
							danger
							size="small"
							onClick={() => {
								deleteDoc(result.ref).catch(console.error)
							}}
						>
							Delete
						</Button>
					) : (
						`Result #${index === undefined ? `???` : index + 1}`
					)
				) : (
					`Result #${index === undefined ? `???` : index + 1}`
				)
			}
			extra={
				isEditing ? (
					<div className="ml-4 flex gap-2">
						<Button size="small" onClick={() => onEditEnd()}>
							Cancel
						</Button>
						<Button size="small" type="primary" htmlType="submit" form="result-form">
							Done
						</Button>
					</div>
				) : (
					<Button type="text" size="small" className="text-primary" onClick={() => onEditStart?.()}>
						Edit
					</Button>
				)
			}
		>
			{isEditing ? (
				<form
					id="result-form"
					onSubmit={(e) => {
						onSubmit(e).catch(console.error)
					}}
				>
					<Form.Item
						validateStatus={formValidateStatus(getFieldState(`text`, formState))}
						help={formState.errors.text?.message}
					>
						<RhfStretchyTextArea control={control} name="text" placeholder="Description" />
					</Form.Item>
				</form>
			) : (
				<p className="min-w-0">{result?.data().text}</p>
			)}
		</Card>
	)
}

export default ResultCard
