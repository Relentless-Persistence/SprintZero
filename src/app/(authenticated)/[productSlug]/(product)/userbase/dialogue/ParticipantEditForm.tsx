import {zodResolver} from "@hookform/resolvers/zod"
import {useJsApiLoader} from "@react-google-maps/api"
import {AutoComplete, Radio} from "antd"
import axios from "axios"
import clsx from "clsx"
import {Timestamp, updateDoc} from "firebase/firestore"
import {useCallback, useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import usePlacesAutocomplete, {getGeocode} from "use-places-autocomplete"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {z} from "zod"
import type {Participant} from "~/types/db/Products/Participants"

import LinkTo from "~/components/LinkTo"
import RhfAutoComplete from "~/components/rhf/RhfAutoComplete"
import RhfCheckbox from "~/components/rhf/RhfCheckbox"
import RhfRadioGroup from "~/components/rhf/RhfRadioGroup"
import {ParticipantSchema} from "~/types/db/Products/Participants"

const formSchema = ParticipantSchema.pick({
	disabilities: true,
	location: true,
	status: true,
	timing: true,
})
type FormInputs = z.infer<typeof formSchema>

export type ParticipantEditFormProps = {
	participant: QueryDocumentSnapshot<Participant>
	onFinish: () => void
}

const ParticipantEditForm: FC<ParticipantEditFormProps> = ({participant, onFinish}) => {
	const participantData = participant.data()

	const {control, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			disabilities: participant.data().disabilities,
			location: participant.data().location,
			status: participant.data().status,
			timing: participant.data().timing ?? undefined,
		},
	})

	const onSubmit = handleSubmit(async (data) => {
		await updateDoc(participant.ref, {...data, updatedAt: Timestamp.now()})
		onFinish()
	})

	const {init, ready, value, setValue, suggestions, clearSuggestions} = usePlacesAutocomplete({
		initOnMount: false,
		requestOptions: {types: [`(cities)`]},
	})

	const {isLoaded} = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ``,
		libraries: useRef<Array<`places`>>([`places`]).current,
	})

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

	useEffect(() => {
		if (isLoaded) {
			init()
			if (participantData.location) handleLocationSelect(participantData.location).catch(console.error)
		}
	}, [isLoaded, init, participantData.location, handleLocationSelect])

	return (
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
								process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY ?? ``
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
					openInNewTab
				>
					Learn more about this place on Wikipedia
				</LinkTo>
			</div>
		</form>
	)
}

export default ParticipantEditForm

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
