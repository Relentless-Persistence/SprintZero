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
                await updateDoc(participant.ref, {
                    location: address,
                    location_id: result.place_id,
                    wiki_link: page?.canonicalurl,
                    updatedAt: Timestamp.now()
                })
            }
            // else {
            //     setPlaceId(undefined) // or setPlaceId('')
            //     await updateDoc(participant.ref, {
            //         location: address,
            //         location_id: ``,
            //         updatedAt: Timestamp.now()
            //     })
            // }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [clearSuggestions, setValue],
    )

    useEffect(() => {
        setValue(participant.data().location, true)
        setPlaceId(participant.data().location_id)
        setWikipediaLink(participant.data().wiki_link)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [participant])

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
                    showSearch
                    control={control}
                    name="location"
                    className="w-full"
                    value={value}
                    onChange={async (data) => {
                        const newLocation = data as string
                        setValue(newLocation)

                        if (newLocation === ``) {
                            setPlaceId(undefined)
                            await updateDoc(participant.ref, {
                                location: newLocation,
                                location_id: ``, // or deleteField(), like before
                                updatedAt: Timestamp.now()
                            })
                        }
                    }}
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
                        <iframe
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            className="h-full w-full"
                        />
                    )}
                </div>
                <LinkTo
                    href={wikipediaLink}
                    style={{ textDecoration: `none` }}
                    className={clsx(
                        `text-sm`,
                        wikipediaLink ? `text-textTertiary underline` : `cursor-not-allowed text-textQuaternary`,
                    )}
                    openInNewTab
                >
                    <span style={{ fontStyle: `italic`, fontSize: `12px`, color: placeId ? `#1677ff` : `rgba(0, 0, 0, 0.25)` }}>Learn more about this place on Wikipedia</span>
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
