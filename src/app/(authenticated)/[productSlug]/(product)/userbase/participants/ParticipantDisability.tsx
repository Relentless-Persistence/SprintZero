import { zodResolver } from "@hookform/resolvers/zod"
import { useJsApiLoader } from "@react-google-maps/api"
import { AutoComplete, Radio } from "antd"
import axios from "axios"
import clsx from "clsx"
import { Timestamp, updateDoc } from "firebase/firestore"
import { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import usePlacesAutocomplete, { getGeocode } from "use-places-autocomplete"

import type { QueryDocumentSnapshot } from "firebase/firestore"
import type { FC } from "react"
import type { z } from "zod"
import type { DialogueParticipant } from "~/types/db/Products/DialogueParticipants"

import LinkTo from "~/components/LinkTo"
import RhfAutoComplete from "~/components/rhf/RhfAutoComplete"
import RhfCheckbox from "~/components/rhf/RhfCheckbox"
import RhfRadioGroup from "~/components/rhf/RhfRadioGroup"
import { DialogueParticipantSchema } from "~/types/db/Products/DialogueParticipants"

const formSchema = DialogueParticipantSchema.pick({
    disabilities: true,
    location: true,
    status: true,
    timing: true,
})
type FormInputs = z.infer<typeof formSchema>

export type ParticipantEditFormProps = {
    participant: QueryDocumentSnapshot<DialogueParticipant>
    onFinish: () => void
}

const ParticipantDisability: FC<ParticipantEditFormProps> = ({ participant, onFinish }) => {
    const participantData = participant.data()

    const { control, handleSubmit } = useForm<FormInputs>({
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
        await updateDoc(participant.ref, { ...data, updatedAt: Timestamp.now() })
        onFinish()
    })

    const { init, ready, value, setValue, suggestions, clearSuggestions } = usePlacesAutocomplete({
        initOnMount: false,
        requestOptions: { types: [`(cities)`] },
    })

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ``,
        libraries: useRef<Array<`places`>>([`places`]).current,
    })

    const [placeId, setPlaceId] = useState<string | undefined>(undefined)
    const [wikipediaLink, setWikipediaLink] = useState<string | undefined>(undefined)
    const handleLocationSelect = useCallback(
        async (address: string) => {
            setValue(address, false)
            clearSuggestions()

            const results = await getGeocode({ address })
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

        >
            <div className="flex flex-col gap-4 mt-2 mb-2 ml-2 mr-2">
                <div className="flex flex-col gap-2">
                    <div className="leading-snug">
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
                    <div className="leading-snug">
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
        </form>
    )
}

export default ParticipantDisability

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
