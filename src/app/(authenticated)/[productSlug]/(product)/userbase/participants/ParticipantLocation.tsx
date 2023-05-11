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

const ParticipantLocation: FC<ParticipantEditFormProps> = ({ participant, onFinish }) => {
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
            className="flex col gap-8"
        >
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
                        suggestions.data.map(({ place_id, description }) => (
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
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY ?? ``
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

export default ParticipantLocation

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
