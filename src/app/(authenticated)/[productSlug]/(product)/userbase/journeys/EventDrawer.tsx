import {Button, Drawer} from "antd"
import {collection} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Promisable} from "type-fest"
import type {z} from "zod"
import type {JourneyEvent} from "~/types/db/Products/JourneyEvents"
import type {Journey} from "~/types/db/Products/Journeys"

import {useAppContext} from "~/app/(authenticated)/AppContext"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfSelect from "~/components/rhf/RhfSelect"
import RhfTextArea from "~/components/rhf/RhfTextArea"
import {JourneyEventSchema} from "~/types/db/Products/JourneyEvents"
import {durationUnits} from "~/types/db/Products/Journeys"
import {PersonaConverter} from "~/types/db/Products/Personas"

const formSchema = JourneyEventSchema.pick({
	description: true,
	emotion: true,
	emotionLevel: true,
	end: true,
	start: true,
	subject: true,
	personaIds: true,
})
type FormInputs = z.infer<typeof formSchema>

export type EventDrawerProps = {
	journey: QueryDocumentSnapshot<Journey>
	activeEvent: QueryDocumentSnapshot<JourneyEvent> | undefined
	onClose: () => void
	onCommit: (event: FormInputs) => Promisable<void>
	onDelete: () => Promisable<void>
}

const EventDrawer: FC<EventDrawerProps> = ({journey, activeEvent, onClose, onCommit, onDelete}) => {
	const {product} = useAppContext()
	const [isDrawerOpen, setIsDrawerOpen] = useState(true)
	const [personas] = useCollection(collection(product.ref, `Personas`).withConverter(PersonaConverter))

	const {control, watch, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: {
			description: activeEvent?.data().description ?? ``,
			emotion: activeEvent?.data().emotion ?? `delighted`,
			emotionLevel: activeEvent?.data().emotionLevel ?? 50,
			end: activeEvent?.data().end ?? journey.data().duration,
			start: activeEvent?.data().start ?? 0,
			subject: activeEvent?.data().subject ?? ``,
			personaIds: activeEvent?.data().personaIds ?? [],
		},
	})

	const [start, end] = watch([`start`, `end`])

	const onSubmit = handleSubmit((data) => {
		Promise.resolve(onCommit(data)).catch(console.error)
		setIsDrawerOpen(false)
		setTimeout(() => {
			onClose()
		}, 300)
	})

	return (
		<Drawer
			open={isDrawerOpen}
			placement="bottom"
			closable={false}
			maskClosable={false}
			title={
				<Button
					danger
					type="primary"
					disabled={activeEvent === undefined}
					onClick={() => {
						Promise.resolve(onDelete()).catch(console.error)
						setIsDrawerOpen(false)
						setTimeout(() => {
							onClose()
						}, 300)
					}}
				>
					Delete
				</Button>
			}
			extra={
				<div className="flex gap-2">
					<Button
						onClick={() => {
							setIsDrawerOpen(false)
							setTimeout(() => {
								onClose()
							}, 300)
						}}
					>
						Cancel
					</Button>
					<Button type="primary" htmlType="submit" form="journey-event-form">
						Done
					</Button>
				</div>
			}
		>
			<form
				id="journey-event-form"
				onSubmit={(e) => {
					onSubmit(e).catch(console.error)
				}}
				className="h-full"
			>
				<div className="grid h-full grid-cols-3 gap-8">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<p className="text-lg font-semibold">Title</p>
							<RhfInput control={control} name="subject" />
						</div>
						<div className="flex grow flex-col gap-2">
							<p className="text-lg font-semibold">Description</p>
							<RhfTextArea
								control={control}
								name="description"
								wrapperClassName="grow"
								className="!h-full !resize-none"
							/>
						</div>
					</div>
					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<p className="text-lg font-semibold">Start</p>
								<RhfSelect
									control={control}
									name="start"
									options={Array(journey.data().duration)
										.fill(undefined)
										.map((_, i) => ({
											value: i,
											label: `${durationUnits[journey.data().durationUnit]} ${i + 1}`,
											disabled: i > end - 1,
										}))}
									className="w-full"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<p className="text-lg font-semibold">End</p>
								<RhfSelect
									control={control}
									name="end"
									options={Array(journey.data().duration)
										.fill(undefined)
										.map((_, i) => ({
											value: i + 1,
											label: `${durationUnits[journey.data().durationUnit]} ${i + 1}`,
											disabled: i < start,
										}))}
									className="w-full"
								/>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-lg font-semibold">Personas Involved</p>
							<RhfSelect
								control={control}
								name="personaIds"
								mode="multiple"
								options={personas?.docs.map((persona) => ({label: persona.data().name, value: persona.id})) ?? []}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col items-start gap-2">
							<p className="text-lg font-semibold">Emotional Scale</p>
							<RhfSegmented
								control={control}
								name="emotion"
								block
								className="w-full"
								options={[
									{label: `Delighted`, value: `delighted`},
									{label: `Frustrated`, value: `frustrated`},
								]}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-lg font-semibold">Impact Level</p>
							<RhfSegmented
								control={control}
								name="emotionLevel"
								block
								options={[
									{label: `0%`, value: 0},
									{label: `25%`, value: 25},
									{label: `50%`, value: 50},
									{label: `75%`, value: 75},
									{label: `100%`, value: 100},
								]}
							/>
						</div>
					</div>
				</div>
			</form>
		</Drawer>
	)
}

export default EventDrawer
