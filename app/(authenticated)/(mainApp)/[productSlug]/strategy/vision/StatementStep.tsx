import {Card, Form, Button} from "antd"
import {diffArrays} from "diff"
import {doc, Timestamp} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocumentData} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"
import type {Id} from "~/types"

import {generateProductVision} from "./getGptResponse"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfTextListEditor from "~/components/rhf/RhfTextListEditor"
import {ProductConverter, Products} from "~/types/db/Products"
import {auth, db} from "~/utils/firebase"
import {updateProduct} from "~/utils/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const listToSentence = (list: string[]) => {
	if (list.length === 0) return ``
	if (list.length === 1) return list[0]!
	const last = list.pop()
	return `${list.join(`, `)}${list.length > 1 ? `,` : ``} and ${last}`
}

const formSchema = z.object({
	type: z.enum([`mobile`, `tablet`, `desktop`, `watch`, `web`]),
	valueProposition: z.string(),
	features: z.array(z.object({id: z.string(), text: z.string()})),
})
type FormInputs = z.infer<typeof formSchema>

export type BuildStatementProps = {
	onFinish: (gptResponse: string) => void
}

const StatementStep: FC<BuildStatementProps> = ({onFinish}) => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))
	const [user] = useAuthState(auth)
	const [status, setStatus] = useState<`initial` | `submitted` | `finished`>(`initial`)

	const {control, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: {
			type: activeProduct?.productType ?? `mobile`,
			valueProposition: activeProduct?.valueProposition ?? ``,
			features: activeProduct?.features ?? [{id: nanoid(), text: ``}],
		},
	})

	const onSubmit = handleSubmit(async (data: FormInputs) => {
		if (status !== `initial`) return
		setStatus(`submitted`)

		data.features = data.features.filter((feature) => feature.text !== ``)
		const gptResponse = await generateProductVision({
			productType: data.type,
			valueProposition: data.valueProposition,
			features: data.features.map((f) => f.text),
		})

		const newProduct = produce(activeProduct!, (draft) => {
			let operations: string[] = []
			if (draft.productType !== data.type) {
				operations.push(`changed the product type to ${data.type}`)
				draft.productType = data.type
			}
			if (draft.valueProposition !== data.valueProposition) {
				operations.push(`changed the value proposition to "${data.valueProposition}"`)
				draft.valueProposition = data.valueProposition
			}
			if (draft.features !== data.features) {
				const differences = diffArrays(
					draft.features.map((feature) => feature.text),
					data.features.map((feature) => feature.text),
				)

				const removals = differences
					.filter((difference) => difference.removed)
					.flatMap((difference) => difference.value)
					.map((removal) => `"${removal}"`)
				let removalsText = removals.length > 0 ? listToSentence(removals) : undefined
				removalsText = removalsText ? `removed the features ${removalsText}` : undefined
				if (removalsText) operations.push(removalsText)

				const additions = differences
					.filter((difference) => difference.added)
					.flatMap((difference) => difference.value)
					.map((addition) => `"${addition}"`)
				let additionsText = additions.length > 0 ? listToSentence(additions) : undefined
				additionsText = additionsText ? `added the features ${additionsText}` : undefined
				if (additionsText) operations.push(additionsText)

				draft.features = data.features
			}

			const operationsText = listToSentence(operations).concat(`.`)
			if (operations.length > 0)
				draft.updates.push({
					id: nanoid(),
					userId: user!.uid as Id,
					text: operationsText,
					timestamp: Timestamp.now(),
				})
		})
		await updateProduct({id: activeProduct!.id, data: newProduct})

		onFinish(gptResponse)
		setStatus(`finished`)
	})

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="space-y-2">
				<p className="text-xl font-semibold">Statement</p>
				<p className="text-sm text-laurel">What&apos;s this thing gonna be?</p>
			</div>

			<Card
				style={{
					boxShadow: `0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)`,
				}}
			>
				<Form id="statement-form" layout="vertical" onFinish={() => void onSubmit()}>
					<div className="space-y-4">
						<Form.Item label={<span className="font-semibold">Type</span>}>
							<RhfSegmented
								control={control}
								name="type"
								options={[
									{label: `Mobile`, value: `mobile`},
									{label: `Tablet`, value: `tablet`},
									{label: `Desktop`, value: `desktop`},
									{label: `Watch`, value: `watch`},
									{label: `Web`, value: `web`},
								]}
							/>
						</Form.Item>

						<Form.Item label={<span className="font-semibold">Value Proposition</span>}>
							<RhfInput
								control={control}
								name="valueProposition"
								placeholder="eg. Making it easy to to create albums of photos/videos"
							/>
						</Form.Item>

						<Form.Item label={<span className="font-semibold">Features</span>}>
							<RhfTextListEditor control={control} name="features" />
						</Form.Item>
					</div>
				</Form>
			</Card>

			<div className="flex justify-end gap-2">
				<Button className="bg-white">Reset</Button>
				<Button
					type="primary"
					htmlType="submit"
					loading={status === `submitted`}
					disabled={status === `finished`}
					form="statement-form"
					className="bg-green"
				>
					Submit
				</Button>
			</div>
		</div>
	)
}

export default StatementStep
