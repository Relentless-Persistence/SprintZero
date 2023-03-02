import {
	CloseOutlined,
	EyeOutlined,
	FlagOutlined,
	MailOutlined,
	PhoneOutlined,
	PushpinOutlined,
	SyncOutlined,
} from "@ant-design/icons"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button, Drawer, Tag} from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {Timestamp, collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"

import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {z} from "zod"
import type {Id} from "~/types"
import type {Participant} from "~/types/db/Participants"

import ParticipantEditForm from "./ParticipantEditForm"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSelect from "~/components/rhf/RhfSelect"
import RhfTextArea from "~/components/rhf/RhfTextArea"
import {ParticipantSchema, statuses, timings} from "~/types/db/Participants"
import {PersonaConverter} from "~/types/db/Personas"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"
import EarIcon from "~public/icons/ear.svg"

dayjs.extend(relativeTime)

const formSchema = ParticipantSchema.pick({
	availability: true,
	email: true,
	name: true,
	phoneNumber: true,
	title: true,
	transcript: true,
	personaIds: true,
})
type FormInputs = z.infer<typeof formSchema>

export type ParticipantDrawerProps = {
	participants: QuerySnapshot<Participant> | undefined
	activeParticipant: Id | undefined
	onClose: () => void
}

const ParticipantDrawer: FC<ParticipantDrawerProps> = ({participants, activeParticipant, onClose}) => {
	const activeProductId = useActiveProductId()

	const [isOpen, setIsOpen] = useState(true)
	const close = () => {
		setIsOpen(false)
		setTimeout(() => {
			onClose()
		}, 300)
	}

	const [isEditing, setIsEditing] = useState(false)
	const participant = participants?.docs.find((participant) => participant.id === activeParticipant)
	const participantData = participant?.data()

	const [personas] = useCollection(
		query(collection(db, `Personas`), where(`productId`, `==`, activeProductId)).withConverter(PersonaConverter),
	)

	const [lastUpdatedAtUser] = useDocument(
		participant?.data().updatedAtUserId
			? doc(db, `Users`, participant.data().updatedAtUserId).withConverter(UserConverter)
			: undefined,
	)

	const {control, handleSubmit, setValue} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		shouldFocusError: false,
		defaultValues: {
			availability: participantData?.availability ?? [],
			email: participantData?.email ?? ``,
			name: participantData?.name ?? `New Participant`,
			phoneNumber: participantData?.phoneNumber ?? ``,
			title: participantData?.title ?? null,
			transcript: participantData?.transcript ?? ``,
		},
	})

	const onSubmit = handleSubmit(async (data) => {
		if (!activeParticipant) return
		await updateDoc(doc(db, `Participants`, activeParticipant), {
			...data,
			updatedAt: Timestamp.now(),
		})
	})

	useEffect(() => {
		if (!participantData) return
		setValue(`transcript`, participantData.transcript)
		setValue(`name`, participantData.name)
		setValue(`email`, participantData.email)
		setValue(`phoneNumber`, participantData.phoneNumber)
	}, [participantData, setValue])

	return (
		<Drawer
			placement="bottom"
			closable={false}
			height={400}
			open={isOpen}
			onClose={close}
			title={
				isEditing ? (
					<Button type="primary" danger>
						Delete
					</Button>
				) : (
					<div className="flex flex-col gap-1">
						<div className="flex items-end gap-4">
							<p className="font-semibold">{participant?.data().name}</p>
							{participant && (
								<p className="mb-0.5 text-sm font-normal text-textTertiary">
									Last modified {dayjs(participant.data().updatedAt.toMillis()).fromNow()}
									{lastUpdatedAtUser?.data() && ` by ${lastUpdatedAtUser.data()!.name}`}
								</p>
							)}
						</div>
						<div className="flex gap-2">
							{participantData?.location && (
								<Tag color="#585858" icon={<PushpinOutlined />}>
									{participantData.location}
								</Tag>
							)}
							{participantData?.status && (
								<Tag color="#585858" icon={<FlagOutlined />}>
									{statuses.find((status) => status[0] === participantData.status)![1]}
								</Tag>
							)}
							{participantData?.disabilities.auditory && (
								<Tag color="#585858" icon={<EarIcon className="inline-block" />} className="flex items-center">
									Auditory
								</Tag>
							)}
							{participantData?.disabilities.cognitive && (
								<Tag color="#585858" icon={<PushpinOutlined />}>
									Cognitive
								</Tag>
							)}
							{participantData?.disabilities.physical && (
								<Tag color="#585858" icon={<PushpinOutlined />}>
									Physical
								</Tag>
							)}
							{participantData?.disabilities.speech && (
								<Tag color="#585858" icon={<PushpinOutlined />}>
									Speech
								</Tag>
							)}
							{participantData?.disabilities.visual && (
								<Tag color="#585858" icon={<EyeOutlined />}>
									Visual
								</Tag>
							)}
							{participantData?.timing && (
								<Tag color="#585858" icon={<SyncOutlined />}>
									{timings.find((timing) => timing[0] === participantData.timing)![1]}
								</Tag>
							)}
						</div>
					</div>
				)
			}
			extra={
				isEditing ? (
					<div className="flex gap-2">
						<Button onClick={() => setIsEditing(false)}>Cancel</Button>
						<Button type="primary" htmlType="submit" form="participant-form">
							Save
						</Button>
					</div>
				) : (
					<div className="flex gap-4">
						<Button
							onClick={() => {
								setIsEditing(true)
							}}
						>
							Edit
						</Button>
						<button type="button" onClick={close}>
							<CloseOutlined />
						</button>
					</div>
				)
			}
		>
			{isEditing && participant ? (
				<ParticipantEditForm participant={participant} onFinish={close} />
			) : (
				<form className="grid h-full grid-cols-[2fr_1fr] gap-6">
					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Interview Transcript</p>
						<RhfTextArea
							control={control}
							name="transcript"
							onChange={() => {
								onSubmit().catch(console.error)
							}}
							className="grow !resize-none"
						/>
					</div>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<p className="text-lg font-semibold">Contact</p>
							<RhfInput
								control={control}
								name="name"
								onChange={() => {
									onSubmit().catch(console.error)
								}}
								addonBefore={
									<RhfSelect
										control={control}
										name="title"
										onChange={() => {
											onSubmit().catch(console.error)
										}}
										className="w-20"
										options={[
											{label: `Dr.`, value: `dr`},
											{label: `Miss`, value: `miss`},
											{label: `Mr.`, value: `mr`},
											{label: `Mrs.`, value: `mrs`},
											{label: `Ms.`, value: `ms`},
											{label: `Prof.`, value: `prof`},
											{label: `Sir`, value: `sir`},
										]}
									/>
								}
							/>
							<RhfInput
								control={control}
								name="email"
								onChange={() => {
									onSubmit().catch(console.error)
								}}
								addonBefore={<MailOutlined />}
							/>
							<RhfInput
								control={control}
								name="phoneNumber"
								onChange={() => {
									onSubmit().catch(console.error)
								}}
								addonBefore={<PhoneOutlined />}
							/>
							<RhfSelect
								control={control}
								name="availability"
								mode="multiple"
								onChange={() => {
									onSubmit().catch(console.error)
								}}
								className="w-full"
								options={[
									{label: `9am - 5pm only`, value: `95only`},
									{label: `Email`, value: `email`},
									{label: `Phone`, value: `phone`},
									{label: `Text`, value: `text`},
									{label: `Weekdays only`, value: `weekdays`},
									{label: `Weekends only`, value: `weekends`},
								]}
							/>
						</div>
						<div>
							<p className="text-lg font-semibold">Personas</p>
							<RhfSelect
								control={control}
								name="personaIds"
								mode="multiple"
								onChange={() => {
									onSubmit().catch(console.error)
								}}
								options={
									personas ? personas.docs.map((persona) => ({label: persona.data().name, value: persona.id})) : []
								}
								className="w-full"
							/>
						</div>
					</div>
				</form>
			)}
		</Drawer>
	)
}

export default ParticipantDrawer
