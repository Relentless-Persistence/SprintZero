"use client"

import { DownOutlined, EyeOutlined, PhoneOutlined, SoundOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import Icon from "@ant-design/icons/lib/components/Icon";
import { Avatar, Breadcrumb, Button, Card, Dropdown, Empty, Space, Spin, Tabs, Tag, message } from "antd"
import { Timestamp, addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react"
import { useErrorHandler } from "react-error-boundary";
import { useCollection } from "react-firebase-hooks/firestore";
import Masonry from "react-masonry-css"

import type { MenuProps } from "antd";
import type { FC } from "react";

import TextareaCard from "./TextareaCard";
import { useAppContext } from "../../../AppContext"
import { DialogueParticipantConverter } from "~/types/db/Products/DialogueParticipants";
import { PersonaConverter } from "~/types/db/Products/Personas";
import { GoalConverter } from "~/types/db/Products/Personas/Goals";
import BoneIcon from "~public/icons/bone.svg"
import CognitionIcon from "~public/icons/cognition.svg"
import EarIcon from "~public/icons/ear.svg"

const items: MenuProps['items'] = [
    {
        label: `1st menu item`,
        key: `1`,
    },
    {
        label: `2nd menu item`,
        key: `2`,
    },
    {
        label: `3rd menu item`,
        key: `3`,
    },
    {
        label: `4rd menu item`,
        key: `4`,
    },
];

const PersonasClientPage: FC = () => {
    const { product, user } = useAppContext()
    const [currentPersona, setCurrentPersona] = useState(``)
    const [currentTab, setCurrentTab] = useState<(typeof tabs)[number][0]>(`description`)
    const [activeParticipant, setActiveParticipant] = useState<string | undefined>(undefined)

    const [goalEditingItem, setGoalEditingItem] = useState<string | undefined>(undefined)

    const [participants, , participantsError] = useCollection(collection(product.ref, `DialogueParticipants`).withConverter(DialogueParticipantConverter),)
    useErrorHandler(participantsError)
    const [personas, , personasError] = useCollection(collection(product.ref, `Personas`).withConverter(PersonaConverter))
    useErrorHandler(personasError)

    const handlePersonaClick: MenuProps['onClick'] = (e) => {
        setCurrentPersona(e.key)
    };

    const items: MenuProps['items'] = personas?.docs.map((persona) => ({ key: persona.id, label: persona.data().name }))

    const menuProps = {
        items,
        onClick: handlePersonaClick,
    };

    const [goals, , goalsError] = useCollection(
        personas && currentPersona
            ? collection(personas.docs.find((persona) => persona.id === currentPersona)!.ref, `Goals`).withConverter(GoalConverter)
            : undefined,
    )
    useErrorHandler(goalsError)

    const hasSetDefaultPersona = useRef(false)
    useEffect(() => {
        if (personas?.docs[0] && !hasSetDefaultPersona.current) {
            setCurrentPersona(personas.docs[0].id)
            hasSetDefaultPersona.current = true
        }
    }, [personas])

    return (
        <div className="grid h-full grid-cols-[1fr_auto]">
            <div className="relative flex flex-col gap-4 overflow-auto px-12 py-8">
                <Breadcrumb items={[{ title: `Userbase` }, { title: `Participants` }, { title: tabs.find(([key]) => key === currentTab)![1] },]} />
                <div className="leading-normal">
                    <h1 className="text-4xl font-semibold">Learning never stops</h1>
                    <p className="text-base text-textSecondary">
                        Track study participants, access contact information, and store interview transcripts
                    </p>
                </div>

                <Tabs
                    tabBarExtraContent={
                        <Dropdown menu={menuProps}>
                            <Button>
                                <Space>
                                    {personas?.docs.find(doc => doc.id === currentPersona)?.data().name}
                                    <DownOutlined />
                                </Space>
                            </Button>
                        </Dropdown>
                    }
                    tabPosition="top"
                    activeKey={currentTab}
                    onChange={(tab: (typeof tabs)[number][0]) => setCurrentTab(tab)}
                    items={tabs.map(([key, label]) => ({
                        key, label
                    }))}
                />

                {participants ? (
                    participants.docs.length === 0 ? (
                        <div className="grid grow place-items-center">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    ) : (
                        currentTab === `goals` && (
                            <div className="grid grid-cols-3 gap-4">
                                {goals?.docs.sort((a, b) => a.data().name.localeCompare(b.data().name)).map((goal, index) => {
                                    return (
                                        <div key={index}>
                                            <TextareaCard
                                                title={goal.data().name}
                                                text={goal.data().text}
                                                isEditing={goalEditingItem === goal.id}
                                                onEditStart={() => setGoalEditingItem(goal.id)}
                                                onEditEnd={() => setGoalEditingItem(undefined)}
                                                onCommit={async (text) => {
                                                    const personaRef = personas?.docs.find(doc => doc.id === currentPersona)?.ref
                                                    await updateDoc(personaRef, `Goals`, goal.id, { text })
                                                }}
                                            />
                                        </div>
                                    )
                                })}
                                <Button onClick={async () => {
                                    const personaRef = personas?.docs.find(doc => doc.id === currentPersona)?.ref;
                                    const goalsCollectionRef = collection(personaRef, `Goals`);
                                    const newGoalDocRef = doc(goalsCollectionRef, nanoid());

                                    await setDoc(newGoalDocRef, {
                                        name: `Goal #${goals?.docs.length + 1}`,
                                        text: ``
                                    });
                                }}>Add Goal</Button>
                            </div>
                        )
                        // <Masonry
                        //     breakpointCols={{ default: 2, 1700: 2, 1300: 2, 1000: 1 }}
                        //     className="flex gap-6"
                        //     columnClassName="flex flex-col gap-4"
                        // >

                        //     {participants.docs
                        //         .filter((participant) => participant.data().status === currentTab)
                        //         .map((participant) => {
                        //             return (
                        //                 <Card
                        //                     key={participant.id}
                        //                     type="inner"
                        //                     title={
                        //                         <div className="my-4 mr-2 flex items-center gap-4">
                        //                             <Avatar icon={<UserOutlined />} shape="square" size="large" />
                        //                             <div className="min-w-0 flex-1">
                        //                                 <p className="truncate">{participant.data().name}</p>
                        //                                 {participant.data().location && (
                        //                                     <p className="font-normal text-textTertiary">{participant.data().location}</p>
                        //                                 )}
                        //                             </div>
                        //                         </div>
                        //                     }
                        //                     extra={
                        //                         <Button onClick={() => setActiveParticipant(participant.id)}>
                        //                             View
                        //                         </Button>
                        //                     }
                        //                 >
                        //                     <div className="flex flex-wrap gap-2">
                        //                         {personas?.docs.map((persona) => {
                        //                             if (persona.id === participant.data().personaId) {
                        //                                 return (
                        //                                     <Tag key={persona.id} color="geekblue" icon={<UserOutlined />}>
                        //                                         {persona.data().name}
                        //                                     </Tag>
                        //                                 );
                        //                             } else {
                        //                                 return null;
                        //                             }
                        //                         })}
                        //                         {participant.data().disabilities.auditory && (
                        //                             <Tag
                        //                                 color="gold"
                        //                                 icon={<EarIcon className="mr-1.5 inline-block" />}
                        //                                 className="flex items-center"
                        //                             >
                        //                                 Auditory
                        //                             </Tag>
                        //                         )}
                        //                         {participant.data().disabilities.cognitive && (
                        //                             <Tag
                        //                                 color="gold"
                        //                                 icon={<CognitionIcon className="mr-1.5 inline-block" />}
                        //                                 className="flex items-center"
                        //                             >
                        //                                 Cognitive
                        //                             </Tag>
                        //                         )}
                        //                         {participant.data().disabilities.physical && (
                        //                             <Tag
                        //                                 color="gold"
                        //                                 icon={<BoneIcon className="mr-1.5 inline-block stroke-current" />}
                        //                                 className="flex items-center"
                        //                             >
                        //                                 Physical
                        //                             </Tag>
                        //                         )}
                        //                         {participant.data().disabilities.speech && (
                        //                             <Tag
                        //                                 color="gold"
                        //                                 icon={<SoundOutlined className="inline-block" />}
                        //                                 className="flex items-center"
                        //                             >
                        //                                 Speech
                        //                             </Tag>
                        //                         )}
                        //                         {participant.data().disabilities.visual && (
                        //                             <Tag color="gold" icon={<EyeOutlined />} className="flex items-center">
                        //                                 Visual
                        //                             </Tag>
                        //                         )}
                        //                         {participant.data().phoneNumber && (
                        //                             <Tag color="red" icon={<PhoneOutlined />}>
                        //                                 {participant.data().phoneNumber}
                        //                             </Tag>
                        //                         )}
                        //                     </div>
                        //                 </Card>
                        //             )
                        //         })}


                        // </Masonry>
                    )
                ) : (
                    <Spin />
                )}

            </div>
            {/* {activeParticipant !== undefined && (
                <ParticipantDrawer
                    participants={participants}
                    activeParticipant={activeParticipant}
                    onClose={() => setActiveParticipant(undefined)}
                />
            )} */}
        </div>
    )
}

export default PersonasClientPage

const tabs = [
    [`description`, `Description`],
    [`timelines`, `Timelines`],
    [`goals`, `Goals`],
    [`interactions`, `Interactions`],
    [`criticality`, `Criticality`],
    [`responsibilities`, `Responsibilities`],
    [`priorities`, `Priorities`],
    [`frustrations`, `Frustrations`],
    [`changes`, `Changes`],
] as const
