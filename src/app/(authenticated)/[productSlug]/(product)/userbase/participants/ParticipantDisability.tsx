import { zodResolver } from "@hookform/resolvers/zod"
import { useJsApiLoader } from "@react-google-maps/api"
import { AutoComplete, Radio } from "antd"
import axios from "axios"
import clsx from "clsx"
import { Timestamp, updateDoc } from "firebase/firestore"
import _ from 'lodash' // for isEqual
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
    timing: true,
})
type FormInputs = z.infer<typeof formSchema>

export type ParticipantEditFormProps = {
    participant: QueryDocumentSnapshot<DialogueParticipant>
    onFinish: () => void
}

const ParticipantDisability: FC<ParticipantEditFormProps> = ({ participant, onFinish }) => {
    const participantData = participant.data()

    const { control, handleSubmit, watch } = useForm<FormInputs>({
        mode: `onChange`,
        resolver: zodResolver(formSchema),
        defaultValues: {
            disabilities: participant.data().disabilities,
            timing: participant.data().timing ?? null,
        },
    })



    const saveData = async (data: FormInputs) => {
        await updateDoc(participant.ref, { ...data, updatedAt: Timestamp.now() })
    }

    // Watch for changes in form values
    //    const disabilities = watch(`disabilities`);
    const auditory = watch(`disabilities.auditory`);
    const cognitive = watch(`disabilities.cognitive`);
    const physical = watch(`disabilities.physical`);
    const speech = watch(`disabilities.speech`);
    const visual = watch(`disabilities.visual`);
    const timing = watch(`timing`);

    const initialRender = useRef(true)

    useEffect(() => {
        // Trigger form submission when form values change

        if (initialRender.current) {
            initialRender.current = false
            return
        }

        saveData({
            disabilities: { auditory, cognitive, physical, speech, visual },
            timing
        }).catch(console.error);
    }, [auditory, cognitive, physical, speech, visual, timing])

    return (
        <form
            id="participant-form"
            onSubmit={(e) => {
                e.preventDefault()
                //onSubmit(e).catch(console.error)
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
