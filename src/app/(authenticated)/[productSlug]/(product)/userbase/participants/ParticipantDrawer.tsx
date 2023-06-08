import {
  CloseOutlined,
  EyeOutlined,
  FlagOutlined,
  MailOutlined,
  PhoneOutlined,
  PushpinOutlined,
  SoundOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Drawer, Dropdown, Menu, Popover, Skeleton, Tag, Typography } from 'antd';
import axios from "axios"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Timestamp, collection, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { deleteObject, ref } from "firebase/storage";
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection, useDocument } from "react-firebase-hooks/firestore"
import { useForm } from "react-hook-form"

import type { MenuProps } from 'antd';
import type { QuerySnapshot, WithFieldValue } from "firebase/firestore"
import type { FC } from "react"
import type { z } from "zod"
import type { DialogueParticipant } from "~/types/db/Products/DialogueParticipants";


import DragDrop from "./DragDrop"
import ParticipantDisability from "./ParticipantDisability";
import ParticipantEditForm from "./ParticipantEditForm"
import ParticipantLocation from "./ParticipantLocation";
//import ParticipantStatus from "./ParticipantStatus";
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import LinkTo from "~/components/LinkTo";
import RhfInput from "~/components/rhf/RhfInput"
import RhfSelect from "~/components/rhf/RhfSelect"
import RhfTextArea from "~/components/rhf/RhfTextArea"
import { DialogueParticipantConverter, DialogueParticipantSchema, statuses, timings } from "~/types/db/Products/DialogueParticipants"
import { MemberConverter } from "~/types/db/Products/Members"
import { PersonaConverter } from "~/types/db/Products/Personas"
import { storage } from "~/utils/firebase";
import { updateItem } from "~/utils/storyMap";
import BoneIcon from "~public/icons/bone.svg"
import CognitionIcon from "~public/icons/cognition.svg"
import EarIcon from "~public/icons/ear.svg"
import PhysicalDisability from "~public/icons/physical-disability.svg"

dayjs.extend(relativeTime)

const { Text } = Typography;

const formSchema = DialogueParticipantSchema.pick({
  availability: true,
  email: true,
  name: true,
  phoneNumber: true,
  title: true,
  transcript: true,
  personaId: true,
})
type FormInputs = z.infer<typeof formSchema>

export type ParticipantDrawerProps = {
  participants: QuerySnapshot<DialogueParticipant> | undefined
  activeParticipant: string | undefined
  onClose: () => void
}

const items: MenuProps[`items`] = [
  { key: `identified`, label: `Identified` },
  { key: `contacted`, label: `Contacted` },
  { key: `scheduled`, label: `Scheduled` },
  { key: `interviewed`, label: `Interviewed` },
  { key: `analyzing`, label: `Analyzing` },
  { key: `processed`, label: `Processed` }
]

interface TranscribeResponse {
  data: {
    transcript: string
  }
}

const ParticipantDrawer: FC<ParticipantDrawerProps> = ({ participants, activeParticipant, onClose }) => {
  const { product } = useAppContext()

  const participant = participants?.docs.find((participant) => participant.id === activeParticipant)
  const participantData = participant?.data()

  const [isOpen, setIsOpen] = useState(true)
  const close = () => {
    setIsOpen(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [audioUrl, setAudioUrl] = useState(``)
  const [storageBucketUri, setStorageBucketUri] = useState(``)
  const [loadingTranscript, setLoadingTranscrript] = useState(false)
  const [participantStatusPopoverIsOpen, setParticipantStatusPopoverIsOpen] = useState(false)
  const [participantDisabilityPopoverIsOpen, setParticipantDisabilityPopoverIsOpen] = useState(false)
  const [participantStatusKey, setParticipantStatusKey] = useState<string>(Object.entries(statuses).find(([key]) => key === participantData?.status)![0])
  const [participantStatusLabel, setParticipantStatusLabel] = useState<string>(Object.entries(statuses).find(([key]) => key === participantData?.status)![1])

  type statusKey = keyof typeof statuses
  const handleParticipantStatusChange = async ({ key }: { key: string }) => {
    const label = Object.entries(statuses).find(([keyL, valueL]) => keyL === key)![1];
    setParticipantStatusKey(key);
    setParticipantStatusLabel(label);
    const participantRef = doc(product.ref, `DialogueParticipants`, participant!.id);
    await updateDoc(participantRef, {
      status: key as WithFieldValue<statusKey>
    })
  };

  const [personas, , personasError] = useCollection(collection(product.ref, `Personas`).withConverter(PersonaConverter))
  useErrorHandler(personasError)
  const [lastUpdatedAtUser, , lastUpdatedAtUserError] = useDocument(
    participant?.data().updatedAtUserId
      ? doc(product.ref, `Members`, participant.data().updatedAtUserId).withConverter(MemberConverter)
      : undefined,
  )
  useErrorHandler(lastUpdatedAtUserError)

  const { control, handleSubmit, setValue } = useForm<FormInputs>({
    mode: `onChange`,
    resolver: zodResolver(formSchema),
    shouldFocusError: false,
    defaultValues: {
      availability: participantData?.availability ?? [],
      email: participantData?.email ?? null,
      name: participantData?.name ?? `New Participant`,
      phoneNumber: participantData?.phoneNumber ?? null,
      title: participantData?.title ?? null,
      transcript: participantData?.transcript ?? ``,
      personaId: participantData?.personaId ?? null,
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (!activeParticipant) return
    await updateDoc(doc(product.ref, `DialogueParticipants`, activeParticipant), {
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

  const fetchTranscript = async (): Promise<void> => {
    setLoadingTranscrript(true)
    try {
      const response: TranscribeResponse = await axios.post(`/api/google/speechToText`, { gcsUri: storageBucketUri });
      const transcript = response.data.transcript;

      if (!transcript) {
        throw new Error(`Transcript not found in response data.`);
      }

      const id: string | undefined = activeParticipant

      if (!id) return

      const participantRef = doc(product.ref, `DialogueParticipants`, id);
      const updateData = {
        transcript,
        transcriptAudio: audioUrl,
        audioFilePath: storageBucketUri,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(participantRef, updateData);
      setLoadingTranscrript(false)
    } catch (error) {
      console.error(error);
      throw new Error(`Something went wrong while fetching transcript.`);
    }
  };

  const deleteAudio = async () => {
    const fullPath: string | undefined = participantData?.audioFilePath;
    const relativePath = fullPath && fullPath.replace(`gs://sprintzero-657f3.appspot.com/`, ``);

    const fileRef = ref(storage, relativePath)

    await deleteObject(fileRef)

    const id: string | undefined = activeParticipant

    if (!id) return

    const participantRef = doc(product.ref, `DialogueParticipants`, id).withConverter(DialogueParticipantConverter);
    const updateData = {
      transcript: ``,
      transcriptAudio: ``,
      audioFilePath: ``,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(participantRef, updateData);
    setIsEditorOpen(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const onClick: MenuProps[`onClick`] = async ({ key }) => {
    const id: string | undefined = activeParticipant

    if (!id) return

    const participantRef = doc(product.ref, `DialogueParticipants`, id);
    const updateData = {
      status: key,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(participantRef, updateData)
  };

  useEffect(() => {
    if (storageBucketUri.length > 0) {
      fetchTranscript().catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageBucketUri])

  return (
    <Drawer
      placement="bottom"
      closable={false}
      height={440}
      open={isOpen}
      onClose={close}
      title={
        (
          <div className="mr-4 flex min-w-0 max-w-full flex-col gap-1 overflow-auto">
            <p className="max-w-full leading-none">
              <span className="mr-4 inline-block max-w-full truncate font-semibold">{participant?.data().name}</span>
              {participant && (
                <span className="mb-0.5 text-sm font-normal text-textTertiary">
                  Last modified {dayjs(participant.data().updatedAt.toMillis()).fromNow()}
                  {lastUpdatedAtUser?.data() && ` by ${lastUpdatedAtUser.data()!.name}`}
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <Popover placement="bottomLeft" content={
                participant && <ParticipantLocation participant={participant} onFinish={close} />
              }
                trigger="click">

                <Button size="small" color="#585858" icon={<PushpinOutlined />} className="flex items-center justify-center" style={{ background: `rgba(0,0,0,0.65)`, color: `#ffffff`, fontSize: `12px` }}>
                  {participantData?.location ? participantData.location : `Location Unknown`}
                </Button>
              </Popover>


              {participantData?.status && (
                <>
                  <Popover style={{ height: `200px`, overflow: `auto`, padding: `6px` }} placement="bottomRight"
                    id="participantStatusPopover"
                    open={participantStatusPopoverIsOpen}
                    content={
                      <Menu
                        mode="vertical"
                        selectedKeys={[participantStatusKey]}
                        onClick={handleParticipantStatusChange}
                        style={{ border: `none`, maxHeight: `300px`, overflow: `auto` }}
                      >
                        {Object.entries(statuses).map(([key, status]) => (
                          <Menu.Item key={key} style={{ height: `30px`, lineHeight: `30px` }} onClick={() => setParticipantStatusPopoverIsOpen(false)}>{status}</Menu.Item>
                        ))}
                      </Menu>
                    } trigger="click">
                    <Button onClick={() => setParticipantStatusPopoverIsOpen(!participantStatusPopoverIsOpen)} size="small" color="#585858" icon={<FlagOutlined />} className="flex items-center justify-center" style={{ background: `rgba(0,0,0,0.65)`, color: `#ffffff`, fontSize: `12px` }}>
                      {participantStatusLabel}
                    </Button>
                  </Popover>

                  {/* <Dropdown menu={{ items, onClick }} placement="bottomRight" arrow>

                    <Button size="small" color="#585858" icon={<FlagOutlined />} className="flex items-center justify-center" style={{ background: `rgba(0,0,0,0.65)`, color: `#ffffff`, fontSize: `12px` }}>
                      {statuses.find((status) => status[0] === participantData.status)![1]}
                    </Button>
                  </Dropdown> */}
                </>
              )
              }

              <Popover placement="bottomLeft" content={
                participant && <ParticipantDisability participant={participant} onFinish={close} />
              }
                trigger="click">

                <Button onClick={() => setParticipantDisabilityPopoverIsOpen(!participantDisabilityPopoverIsOpen)} size="small" color="#585858" icon={<PhysicalDisability className="mr-1.5 inline-block" />} className="flex items-center justify-center" style={{ background: `rgba(0,0,0,0.65)`, color: `#ffffff`, fontSize: `12px` }}>
                  Disability
                </Button>
              </Popover>

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
            <Button onClick={
              () => {
                deleteDoc(participant!.ref).then(() => {
                  close()
                }).catch((error) => console.error(error));
              }
            } danger>
              Delete
            </Button>
            {/* <Button htmlType="submit" form="participant-form">
                            Done
                        </Button> */}
            {/* <Button
                            onClick={() => {
                                setIsEditing(true)
                            }}
                        >
                            Edit
                        </Button> */}
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
        <form className="grid h-full grid-cols-[3fr_2fr] gap-6">
          <div className="flex flex-col gap-2 grow">

            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Interview Transcript</p>
              {participantData?.transcriptAudio && <Button size="small" className="flex items-center" icon={<UploadOutlined />} onClick={() => {
                deleteAudio().catch(console.error)
              }} disabled={loadingTranscript}>Replace audio file</Button>}

              {isEditorOpen && !participantData?.transcriptAudio && <Button size="small" className="flex items-center" icon={<UploadOutlined />} onClick={() => setIsEditorOpen(false)}>Upload audio file</Button>}
            </div>

            {
              // !participantData?.transcript && !isEditorOpen ?
              //   !loadingTranscript ? 

              //   <>
              //     <div className="flex flex-col gap-2 items-center">
              //       <Button type="primary" onClick={() => setIsEditorOpen(true)}>Open Editor</Button>
              //       <Text>or</Text>
              //     </div>
              //     <DragDrop setAudioUrl={setAudioUrl} setStorageBucketUri={setStorageBucketUri} />
              //   </>
              //     :
              //     <div style={{ position: `relative`, justifyContent: `center` }}>
              //       <RhfTextArea
              //         control={control}
              //         name="transcript"
              //         onChange={() => {
              //           onSubmit().catch(console.error)
              //         }}
              //         rows={12}
              //         wrapperClassName="grow"
              //         className="!h-full !resize-none"
              //       />
              //       {!participantData?.transcript && <div style={{ position: `absolute`, top: `50%`, left: `50%`, transform: `translate(-50%, -50%)`, zIndex: 9999, width: `97%` }}>
              //         <Skeleton active loading style={{ height: `50px` }} title={false} paragraph={{ rows: 9 }} />
              //       </div>}
              //     </div>

              //   :
            }

            <div style={{ position: `relative`, justifyContent: `center`, height: `100%` }} className="flex-grow h-full">
              <RhfTextArea

                control={control}
                name="transcript"
                onChange={() => {
                  onSubmit().catch(console.error)
                }}
                rows={12}
                wrapperClassName="grow"
                className="!h-full !resize-none"
                style={{ height: `100%` }}
              />
            </div>




            {/* {participantData?.transcriptAudio && <figure>
              <audio
                style={{ width: `100%` }}
                className="mt-2"
                controls
                src={participantData.transcriptAudio}>
                <LinkTo href={participantData.transcriptAudio}>
                  Download audio
                </LinkTo>
              </audio>
            </figure>} */}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold">Contact</p>
              <label className="leading-normal">
                <span className="text-sm text-textTertiary">Name</span>
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
                      className="w-[78px]"
                      options={[
                        { label: `Dr.`, value: `dr` },
                        { label: `Miss`, value: `miss` },
                        { label: `Mr.`, value: `mr` },
                        { label: `Mrs.`, value: `mrs` },
                        { label: `Ms.`, value: `ms` },
                        { label: `Prof.`, value: `prof` },
                        { label: `Sir`, value: `sir` },
                      ]}
                    />
                  }
                />
              </label>
              <label className="leading-normal">
                <span className="text-sm text-textTertiary">Email Address</span>
                <RhfInput
                  control={control}
                  name="email"
                  onChange={() => {
                    onSubmit().catch(console.error)
                  }}
                  addonBefore={
                    <div className="w-14">
                      <MailOutlined />
                    </div>
                  }
                />
              </label>
              <div className="flex flex-col gap-1">
                <label className="leading-normal">
                  <span className="text-sm text-textTertiary">Phone Number</span>
                  <RhfInput
                    control={control}
                    name="phoneNumber"
                    onChange={() => {
                      onSubmit().catch(console.error)
                    }}
                    addonBefore={
                      <div className="w-14">
                        <PhoneOutlined />
                      </div>
                    }
                  />
                </label>
                <RhfSelect
                  control={control}
                  name="availability"
                  //size="small"
                  mode="multiple"
                  onChange={() => {
                    onSubmit().catch(console.error)
                  }}
                  className="w-full"
                  options={[
                    { label: `9am - 5pm only`, value: `95only` },
                    { label: `Email`, value: `email` },
                    { label: `Phone`, value: `phone` },
                    { label: `Text`, value: `text` },
                    { label: `Weekdays only`, value: `weekdays` },
                    { label: `Weekends only`, value: `weekends` },
                  ]}
                />
              </div>
              <label className="leading-normal">
                <span className="text-sm text-textTertiary">Persona</span>
                <RhfSelect
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => typeof option?.label === `string` ? option.label.includes(input) : false}
                  control={control}
                  name="personaId"
                  onChange={() => {
                    onSubmit().catch(console.error)
                  }}
                  options={
                    personas ? personas.docs.map((persona) => ({ label: persona.data().name, value: persona.id })) : []
                  }
                  className="w-full [contain:inline-size]"
                />
              </label>
            </div>
          </div>
        </form>
      )}
    </Drawer>
  )
}

export default ParticipantDrawer
