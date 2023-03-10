import {Breadcrumb, Button, Form} from "antd"
import {addDoc, collection} from "firebase/firestore"
import {useCollectionData} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"

import type {FC} from "react"
import type {z} from "zod"

import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSelect from "~/components/rhf/RhfSelect"
import {JourneyConverter, JourneySchema} from "~/types/db/Products/Journeys"

const formSchema = JourneySchema.pick({name: true, duration: true, durationUnit: true})
type FormInputs = z.infer<typeof formSchema>

export type AddJourneyPageProps = {
	onCancel: () => void
	onFinish: (newJourneyId: string) => void
}

const AddJourneyPage: FC<AddJourneyPageProps> = ({onCancel, onFinish}) => {
	const {product} = useAppContext()
	const [journeys] = useCollectionData(collection(product.ref, `Journeys`).withConverter(JourneyConverter))

	const {control, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: {
			name: ``,
			durationUnit: `days`,
		},
	})

	const onSubmit = handleSubmit(async (data) => {
		const ref = await addDoc(collection(product.ref, `Journeys`).withConverter(JourneyConverter), data)
		onFinish(ref.id)
	})

	return (
		<div className="flex h-full flex-col px-12 py-8">
			<Breadcrumb>
				<Breadcrumb.Item>Userbase</Breadcrumb.Item>
				<Breadcrumb.Item>Journeys</Breadcrumb.Item>
			</Breadcrumb>
			<div className="grid grow place-items-center">
				<Form
					layout="vertical"
					onFinish={() => {
						onSubmit().catch(console.error)
					}}
				>
					<div className="flex flex-col gap-4">
						<h1 className="text-2xl font-semibold">Create Journey</h1>
						<Form.Item label="Please provide a name:">
							<RhfInput control={control} name="name" placeholder="Name" />
						</Form.Item>
						<Form.Item label="How long does this take end-to-end?">
							<div className="flex gap-4">
								<RhfInput number="integer" control={control} name="duration" />
								<RhfSelect
									control={control}
									name="durationUnit"
									options={[
										{label: `Minutes`, value: `minutes`},
										{label: `Hours`, value: `hours`},
										{label: `Days`, value: `days`},
										{label: `Weeks`, value: `weeks`},
										{label: `Months`, value: `months`},
										{label: `Years`, value: `years`},
									]}
								/>
							</div>
						</Form.Item>
						<div className="mt-2 flex justify-end gap-4">
							<Button disabled={journeys?.length === 0} onClick={() => onCancel()}>
								Cancel
							</Button>
							<Button type="primary" htmlType="submit">
								Submit
							</Button>
						</div>
					</div>
				</Form>
			</div>
		</div>
	)
}

export default AddJourneyPage
