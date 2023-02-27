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
import {useJsApiLoader} from "@react-google-maps/api"
import {AutoComplete, Button, Drawer, Input, Radio, Select, Tag} from "antd"
import axios from "axios"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {Timestamp, addDoc, collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useCallback, useEffect, useRef, useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"
import usePlacesAutocomplete, {getGeocode} from "use-places-autocomplete"

import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type z from "zod"
import type {Id} from "~/types"
import type {Participant} from "~/types/db/Participants"

import LinkTo from "~/components/LinkTo"
import RhfAutoComplete from "~/components/rhf/RhfAutoComplete"
import RhfCheckbox from "~/components/rhf/RhfCheckbox"
import RhfRadioGroup from "~/components/rhf/RhfRadioGroup"
import EarIcon from "~/public/images/ear-icon.svg"
import {ParticipantConverter, ParticipantSchema, statuses, timings} from "~/types/db/Participants"
import {PersonaConverter} from "~/types/db/Personas"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"
import {useUser} from "~/utils/useUser"

dayjs.extend(relativeTime)

const formSchema = ParticipantSchema.pick({disabilities: true, location: true, status: true, timing: true})
type FormInputs = z.infer<typeof formSchema>

export type ParticipantDrawerProps = {
	participants: QuerySnapshot<Participant> | undefined
	activeParticipant: Id | `new` | undefined
	onClose: () => void
}

const ParticipantDrawer: FC<ParticipantDrawerProps> = ({participants, activeParticipant, onClose}) => {
	const [isOpen, setIsOpen] = useState(true)
	const activeProductId = useActiveProductId()
	const user = useUser()
	const [isEditing, setIsEditing] = useState(activeParticipant === `new`)
	useEffect(() => {
		setIsEditing(activeParticipant === `new`)
	}, [activeParticipant])
	const participant = participants?.docs.find((participant) => participant.id === activeParticipant)
	const participantData = participant?.data()

	const {control, handleSubmit, reset} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			disabilities: participant?.data().disabilities ?? {
				auditory: false,
				cognitive: false,
				physical: false,
				speech: false,
				visual: false,
			},
			location: participant?.data().location ?? undefined,
			status: participant?.data().status ?? `identified`,
			timing: participant?.data().timing ?? undefined,
		},
	})

	const [personas] = useCollection(
		query(collection(db, `Personas`), where(`productId`, `==`, activeProductId)).withConverter(PersonaConverter),
	)

	const {init, ready, value, setValue, suggestions, clearSuggestions} = usePlacesAutocomplete({
		initOnMount: false,
		requestOptions: {types: [`(cities)`]},
	})

	const {isLoaded} = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ``,
		libraries: useRef<Array<`places`>>([`places`]).current,
	})

	useEffect(() => {
		if (isLoaded) init()
	}, [isLoaded, init])

	const [placeId, setPlaceId] = useState<string | undefined>(undefined)
	const [wikipediaLink, setWikipediaLink] = useState<string | undefined>(undefined)
	const handleLocationSelect = useCallback(
		async (address: string) => {
			setValue(address, false)
			clearSuggestions()

			const results = await getGeocode({address})
			const result = results[0]
			if (result) {
				setPlaceId(result.place_id)
				const res = await axios.get<MediaWikiSearchApiResponse>(`https://en.wikipedia.org/w/api.php`, {
					params: {
						action: `query`,
						format: `json`,
						generator: `search`,
						gsrlimit: 1,
						gsrsearch: result.formatted_address,
						inprop: `url`,
						prop: `info`,
						origin: `*`,
					},
				})

				const page = res.data.query.pages[Object.keys(res.data.query.pages)[0] ?? ``]
				if (page) setWikipediaLink(page.canonicalurl)
			}
		},
		[clearSuggestions, setValue],
	)

	const onSubmit = handleSubmit(async (data) => {
		if (activeParticipant === `new`) {
			await addDoc(collection(db, `Participants`).withConverter(ParticipantConverter), {
				...data,
				availability: [],
				email: null,
				name: null,
				phoneNumber: null,
				title: null,
				transcript: ``,
				personaIds: [],
				productId: activeProductId,
				updatedAt: Timestamp.now(),
				updatedAtUserId: user!.id as Id,
			})
		} else if (participant) {
			await updateDoc(participant.ref, {...data, updatedAt: Timestamp.now()})
		}
		setIsEditing(false)
	})

	const [lastUpdatedAtUser] = useDocument(
		participant?.data().updatedAtUserId
			? doc(db, `Users`, participant.data().updatedAtUserId).withConverter(UserConverter)
			: undefined,
	)

	const [localTranscript, setLocalTranscript] = useState(participant?.data().transcript ?? ``)
	const [localName, setLocalName] = useState(participant?.data().name ?? ``)
	const [localEmail, setLocalEmail] = useState(participant?.data().email ?? ``)
	const [localPhoneNumber, setLocalPhoneNumber] = useState(participant?.data().phoneNumber ?? ``)
	useEffect(() => {
		setLocalTranscript(participant?.data().transcript ?? ``)
		setLocalName(participant?.data().name ?? ``)
		setLocalEmail(participant?.data().email ?? ``)
		setLocalPhoneNumber(participant?.data().phoneNumber ?? ``)
	}, [participant])

	return (
		<Drawer
			placement="bottom"
			closable={false}
			height={400}
			open={isOpen}
			onClose={() => {
				setIsOpen(false)
				setTimeout(onClose, 300)
			}}
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
								reset({
									disabilities: participantData?.disabilities ?? {
										auditory: false,
										cognitive: false,
										physical: false,
										speech: false,
										visual: false,
									},
									location: participantData?.location ?? undefined,
									status: participantData?.status ?? `identified`,
									timing: participantData?.timing ?? undefined,
								})
								if (isLoaded && participantData?.location)
									handleLocationSelect(participantData.location).catch(console.error)
								setIsEditing(true)
							}}
						>
							Edit
						</Button>
						<button type="button" onClick={() => onClose()}>
							<CloseOutlined />
						</button>
					</div>
				)
			}
		>
			{isEditing ? (
				<form
					id="participant-form"
					onSubmit={(e) => {
						onSubmit(e).catch(console.error)
					}}
					className="grid h-full grid-cols-[1fr_auto_20rem] gap-6"
				>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<div>
								<p className="text-lg font-semibold">Disability</p>
								<p className="text-sm text-textSecondary">Select all that apply</p>
							</div>
							<RhfCheckbox control={control} name="disabilities.auditory">
								Auditory (Hard of hearing, Deafness)
							</RhfCheckbox>
							<RhfCheckbox control={control} name="disabilities.cognitive">
								Cognitive (ADHD, Autism, Memory, Anxiety, Dyslexia, Seizures)
							</RhfCheckbox>
							<RhfCheckbox control={control} name="disabilities.physical">
								Physical (Amputation, Arthritis, Paralysis, Repetitive Stress Injuries)
							</RhfCheckbox>
							<RhfCheckbox control={control} name="disabilities.speech">
								Speech (Muteness, Dysarthria, Stuttering)
							</RhfCheckbox>
							<RhfCheckbox control={control} name="disabilities.visual">
								Visual (Color Blind, Low Vision, Blindness)
							</RhfCheckbox>
						</div>
						<div className="flex flex-col gap-2">
							<div>
								<p className="text-lg font-semibold">Timing</p>
								<p className="text-sm text-textSecondary">Select one only</p>
							</div>
							<RhfRadioGroup control={control} name="timing">
								<Radio value="permanent">Permanent</Radio>
								<Radio value="temporary">Temporary</Radio>
								<Radio value="situational">Situational</Radio>
							</RhfRadioGroup>
						</div>
					</div>
					<div className="mr-12 flex flex-col gap-2">
						<div>
							<p className="text-lg font-semibold">Status</p>
							<p className="text-sm text-textSecondary">Which stage are they in?</p>
						</div>
						<RhfRadioGroup control={control} name="status" className="relative flex flex-col gap-2">
							<div className="absolute left-2 my-2 h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-border" />
							<Radio value="identified">Identified</Radio>
							<Radio value="contacted">Contacted</Radio>
							<Radio value="scheduled">Scheduled</Radio>
							<Radio value="interviewed">Interviewed</Radio>
							<Radio value="analyzing">Analyzing</Radio>
							<Radio value="processed">Processed</Radio>
							<Radio value="archived">Archived</Radio>
						</RhfRadioGroup>
					</div>
					<div className="flex h-full flex-col gap-2">
						<p className="text-lg font-semibold">Location</p>
						<RhfAutoComplete
							control={control}
							name="location"
							className="w-full"
							value={value}
							onChange={(data) => setValue(data as string)}
							disabled={!ready}
							onSelect={(data) => {
								handleLocationSelect(data as string).catch(console.error)
							}}
						>
							{suggestions.status === `OK` &&
								suggestions.data.map(({place_id, description}) => (
									<AutoComplete.Option key={place_id} value={description}>
										{description}
									</AutoComplete.Option>
								))}
						</RhfAutoComplete>
						<div className="grid grow place-items-center overflow-hidden rounded-md border border-primaryBorder bg-primaryBg">
							{placeId ? (
								<iframe
									loading="lazy"
									allowFullScreen
									referrerPolicy="no-referrer-when-downgrade"
									src={`https://www.google.com/maps/embed/v1/place?key=${
										process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ``
									}&q=place_id:${placeId}`}
									className="h-full w-full"
								/>
							) : (
								<p className="italic text-textTertiary">Enter a location above.</p>
							)}
						</div>
						<LinkTo
							href={wikipediaLink}
							className={clsx(
								`text-sm`,
								wikipediaLink ? `text-textTertiary underline` : `cursor-not-allowed text-textQuaternary`,
							)}
						>
							Learn more about this place on Wikipedia
						</LinkTo>
					</div>
				</form>
			) : (
				<div className="grid h-full grid-cols-[2fr_1fr] gap-6">
					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Interview Transcript</p>
						<Input.TextArea
							value={localTranscript}
							onChange={(e) => {
								setLocalTranscript(e.target.value)
								updateDoc(participant!.ref, {transcript: e.target.value}).catch(console.error)
							}}
							className="grow !resize-none"
						/>
					</div>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<p className="text-lg font-semibold">Contact</p>
							<Input
								value={localName}
								onChange={(e) => {
									setLocalName(e.target.value)
									updateDoc(participant!.ref, {name: e.target.value}).catch(console.error)
								}}
								addonBefore={
									<Select
										className="w-20"
										value={participant?.data().title}
										onChange={(value) => {
											updateDoc(participant!.ref, {title: value}).catch(console.error)
										}}
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
							<Input
								value={localEmail}
								onChange={(e) => {
									setLocalEmail(e.target.value)
									if (ParticipantSchema.shape.email.safeParse(e.target.value).success)
										updateDoc(participant!.ref, {email: e.target.value}).catch(console.error)
								}}
								addonBefore={<MailOutlined />}
							/>
							<Input
								value={localPhoneNumber}
								onChange={(e) => {
									setLocalPhoneNumber(e.target.value)
									updateDoc(participant!.ref, {phoneNumber: e.target.value}).catch(console.error)
								}}
								addonBefore={<PhoneOutlined />}
							/>
							<Select
								mode="multiple"
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
							<Select
								mode="multiple"
								options={
									personas ? personas.docs.map((persona) => ({label: persona.data().name, value: persona.id})) : []
								}
								className="w-full"
							/>
						</div>
					</div>
				</div>
			)}
		</Drawer>
	)
}

export default ParticipantDrawer

type MediaWikiSearchApiResponse = {
	query: {
		pages: Record<
			string,
			{
				canonicalurl: string
			}
		>
	}
}
