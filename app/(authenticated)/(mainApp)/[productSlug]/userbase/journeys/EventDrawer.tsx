import {Button, Drawer} from "antd"
import {useForm} from "react-hook-form"

import type {FC} from "react"
import type {Promisable} from "type-fest"
import type {z} from "zod"
import type {Id, WithDocumentData} from "~/types"
import type {Journey} from "~/types/db/Journeys"

import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfSelect from "~/components/rhf/RhfSelect"
import RhfSlider from "~/components/rhf/RhfSlider"
import RhfTextArea from "~/components/rhf/RhfTextArea"
import {JourneyEventSchema} from "~/types/db/JourneyEvents"
import {durationUnits} from "~/types/db/Journeys"

const formSchema = JourneyEventSchema.pick({
	description: true,
	emotion: true,
	emotionLevel: true,
	end: true,
	start: true,
	subject: true,
})
type FormInputs = z.infer<typeof formSchema>

export type EventDrawerProps = {
	journey: WithDocumentData<Journey>
	activeEvent: Id | `new` | undefined
	onClose: () => void
	onCommit: (event: FormInputs) => Promisable<void>
	onDelete: () => Promisable<void>
}

const EventDrawer: FC<EventDrawerProps> = ({journey, activeEvent, onClose, onCommit, onDelete}) => {
	const {control, watch, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: {
			description: ``,
			emotion: `frustrated`,
			emotionLevel: 50,
			end: journey.duration,
			start: 0,
			subject: ``,
		},
	})

	const [start, end] = watch([`start`, `end`])

	const onSubmit = handleSubmit((data) => {
		onClose()
		setTimeout(() => {
			Promise.resolve(onCommit(data)).catch(console.error)
		}, 300)
	})

	return (
		<Drawer
			open={activeEvent !== undefined}
			placement="bottom"
			closable={false}
			maskClosable={false}
			title={
				<div className="flex items-center gap-6">
					<p className="text-lg">Touchpoint</p>
					<Button
						danger
						type="primary"
						size="small"
						disabled={activeEvent === `new`}
						onClick={() => {
							Promise.resolve(onDelete()).catch(console.error)
						}}
					>
						Delete
					</Button>
				</div>
			}
			extra={
				<div className="flex gap-2">
					<Button size="small" onClick={() => onClose()}>
						Cancel
					</Button>
					<Button type="primary" size="small" htmlType="submit" form="journey-event-form">
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
			>
				<div className="grid h-full grid-cols-3 gap-8">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<p className="text-lg font-semibold text-gray">Subject</p>
							<RhfInput control={control} name="subject" />
						</div>
						<div className="flex grow flex-col gap-2">
							<p className="text-lg font-semibold text-gray">Description</p>
							<RhfTextArea control={control} name="description" className="grow !resize-none" />
						</div>
					</div>
					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<p className="text-lg font-semibold text-gray">Start</p>
								<RhfSelect
									control={control}
									name="start"
									options={Array(journey.duration)
										.fill(undefined)
										.map((_, i) => ({
											value: i,
											label: `${durationUnits[journey.durationUnit]} ${i + 1}`,
											disabled: i > end - 1,
										}))}
									className="w-full"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<p className="text-lg font-semibold text-gray">End</p>
								<RhfSelect
									control={control}
									name="end"
									options={Array(journey.duration)
										.fill(undefined)
										.map((_, i) => ({
											value: i + 1,
											label: `${durationUnits[journey.durationUnit]} ${i + 1}`,
											disabled: i < start,
										}))}
									className="w-full"
								/>
							</div>
						</div>
						<div className="flex flex-col items-start gap-2">
							<p className="text-lg font-semibold text-gray">Emotion</p>
							<RhfSegmented
								control={control}
								name="emotion"
								options={[
									{label: `Frustrated`, value: `frustrated`},
									{label: `Delighted`, value: `delighted`},
								]}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-lg font-semibold text-gray">Level</p>
							<RhfSlider
								control={control}
								name="emotionLevel"
								min={0}
								max={100}
								marks={{0: 0, 25: 25, 50: 50, 75: 75, 100: 100}}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<p className="text-lg font-semibold text-gray">Participants</p>
						</div>
					</div>
				</div>
			</form>
		</Drawer>
	)
}

export default EventDrawer
