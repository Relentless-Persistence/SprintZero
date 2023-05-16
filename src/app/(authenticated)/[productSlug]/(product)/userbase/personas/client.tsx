"use client"

import { DislikeOutlined, DownOutlined, EyeOutlined, LikeOutlined, PhoneOutlined, RobotOutlined, SoundOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import Icon from "@ant-design/icons/lib/components/Icon";
import { Avatar, Breadcrumb, Button, Card, Dropdown, Empty, Space, Spin, Tabs, Tag, message } from "antd"
import TextArea from "antd/es/input/TextArea";
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
import { ChangeConverter, CriticalityConverter, FrustrationConverter, GoalConverter, InteractionConverter, PriorityConverter, ResponsibilityConverter } from "~/types/db/Products/Personas/Goals";

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
    const [interactionEditingItem, setInteractionEditingItem] = useState<string | undefined>(undefined)
    const [criticalityEditingItem, setCriticalityEditingItem] = useState<string | undefined>(undefined)
    const [responsibilitiesEditingItem, setResponsibilitiesEditingItem] = useState<string | undefined>(undefined)
    const [prioritiesEditingItem, setPrioritiesEditingItem] = useState<string | undefined>(undefined)
    const [frustrationsEditingItem, setFrustrationsEditingItem] = useState<string | undefined>(undefined)
    const [changesEditingItem, setChangesEditingItem] = useState<string | undefined>(undefined)


    // const [participants, , participantsError] = useCollection(collection(product.ref, `DialogueParticipants`).withConverter(DialogueParticipantConverter),)
    // useErrorHandler(participantsError)
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

    const [interactions, , interactionsError] = useCollection(
        personas && currentPersona
            ? collection(personas.docs.find((persona) => persona.id === currentPersona)!.ref, `Interactions`).withConverter(InteractionConverter)
            : undefined,
    )
    useErrorHandler(interactionsError)

    const [criticalities, , criticalitiesError] = useCollection(
        personas && currentPersona
            ? collection(personas.docs.find((persona) => persona.id === currentPersona)!.ref, `Criticalities`).withConverter(CriticalityConverter)
            : undefined,
    )
    useErrorHandler(criticalitiesError)

    const [responsibilities, , responsibilitiesError] = useCollection(
        personas && currentPersona
            ? collection(personas.docs.find((persona) => persona.id === currentPersona)!.ref, `Responsibilities`).withConverter(ResponsibilityConverter)
            : undefined,
    )
    useErrorHandler(responsibilitiesError)

    const [priorities, , prioritiesError] = useCollection(
        personas && currentPersona
            ? collection(personas.docs.find((persona) => persona.id === currentPersona)!.ref, `Priorities`).withConverter(PriorityConverter)
            : undefined,
    )
    useErrorHandler(prioritiesError)

    const [frustrations, , frustrationsError] = useCollection(
        personas && currentPersona
            ? collection(personas.docs.find((persona) => persona.id === currentPersona)!.ref, `Frustrations`).withConverter(FrustrationConverter)
            : undefined,
    )
    useErrorHandler(frustrationsError)

    const [changes, , changesError] = useCollection(
        personas && currentPersona
            ? collection(personas.docs.find((persona) => persona.id === currentPersona)!.ref, `Changes`).withConverter(ChangeConverter)
            : undefined,
    )
    useErrorHandler(changesError)

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
                        personas?.docs.length !== 0 && <Dropdown menu={menuProps}>
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

                {personas ? (
                    personas.docs.length === 0 ? (
                        <div className="grid grow place-items-center">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    ) : (
                        <>
                            {currentTab === `description` && (
                                <div className="flex gap-6" style={{ height: `600px` }}>
                                    <div className="w-1/3">
                                        <Card title="Description" style={{ width: `100%`, height: `100%`, border: `1px solid #D9D9D9`, borderRadius: `2px` }}
                                            extra={
                                                <div className="flex gap-2">
                                                    <Button className="flex items-center justify-center" icon={<RobotOutlined />}></Button>
                                                </div>
                                            }
                                        >
                                            <TextArea style={{ fontSize: `14px`, lineHeight: 1.8 }} value={personas.docs.find(doc => doc.id === currentPersona)?.data().description} rows={19} />
                                        </Card>
                                    </div>
                                    <div className="w-1/3">
                                        <Card title="Toolset" style={{ width: `100%`, height: `100%`, border: `1px solid #D9D9D9`, borderRadius: `2px` }}
                                            extra={<div className="flex gap-2">
                                                <Button className="flex items-center justify-center" style={{ border: `1px solid #D9D9D9` }} icon={<DislikeOutlined />}></Button>
                                                <Button className="flex items-center justify-center" icon={<LikeOutlined />}></Button>
                                                <Button className="flex items-center justify-center" icon={<RobotOutlined />}></Button>
                                            </div>}>
                                            <div style={{ height: `490px`, overflow: `auto` }}>{personas.docs.find(doc => doc.id === currentPersona)?.data().toolset}</div>
                                        </Card>
                                    </div>
                                    <div className="w-1/3">
                                        <Card title="Education" style={{ width: `100%`, height: `100%`, border: `1px solid #D9D9D9`, borderRadius: `2px` }}
                                            extra={<div className="flex gap-2">
                                                <Button className="flex items-center justify-center" style={{ border: `1px solid #D9D9D9` }} icon={<DislikeOutlined />}></Button>
                                                <Button className="flex items-center justify-center" icon={<LikeOutlined />}></Button>
                                                <Button className="flex items-center justify-center" icon={<RobotOutlined />}></Button>
                                            </div>}>
                                            <div style={{ height: `490px`, overflow: `auto` }}>{personas.docs.find(doc => doc.id === currentPersona)?.data().education} {personas.docs.find(doc => doc.id === currentPersona)?.data().education}</div>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {currentTab === `goals` && (
                                <div className="grid grid-cols-3 gap-4">
                                    {goals?.docs.sort((a, b) => a.data().name.localeCompare(b.data().name)).map((goal, index) => {
                                        return (
                                            <div style={{ height: `205px` }} key={index}>
                                                <TextareaCard
                                                    title={goal.data().name}
                                                    text={goal.data().text}
                                                    isEditing={goalEditingItem === goal.id}
                                                    onEditStart={() => setGoalEditingItem(goal.id)}
                                                    onEditEnd={() => setGoalEditingItem(undefined)}
                                                    onCommit={async (text) => {
                                                        const goalRef = goals.docs.find(doc => doc.id === goal.id)!.ref
                                                        await updateDoc(goalRef, { text })
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                    <div className="flex justify-center items-center" style={{ border: `2px dashed #54A31C`, borderRadius: `6px`, height: `205px` }}>
                                        <Button block={false} type="text" onClick={async () => {
                                            const personaRef = personas.docs.find(doc => doc.id === currentPersona)!.ref;
                                            const goalsCollectionRef = collection(personaRef, `Goals`);
                                            const newGoalDocRef = doc(goalsCollectionRef, nanoid());

                                            await setDoc(newGoalDocRef, {
                                                name: `Goal #${goals!.docs.length + 1}`,
                                                text: ``
                                            });
                                        }}>Add Goal</Button>
                                    </div>
                                </div>

                            )}

                            {currentTab === `interactions` && (
                                <div className="grid grid-cols-3 gap-4">
                                    {interactions?.docs.sort((a, b) => a.data().name.localeCompare(b.data().name)).map((interaction, index) => {
                                        return (
                                            <div style={{ height: `205px` }} key={index}>
                                                <TextareaCard
                                                    title={interaction.data().name}
                                                    text={interaction.data().text}
                                                    isEditing={interactionEditingItem === interaction.id}
                                                    onEditStart={() => setInteractionEditingItem(interaction.id)}
                                                    onEditEnd={() => setInteractionEditingItem(undefined)}
                                                    onCommit={async (text) => {
                                                        const interactionRef = interactions.docs.find(doc => doc.id === interaction.id)!.ref
                                                        await updateDoc(interactionRef, { text })
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                    <div className="flex justify-center items-center" style={{ border: `2px dashed #54A31C`, borderRadius: `6px`, height: `205px` }}>
                                        <Button block={false} type="text" onClick={async () => {
                                            const personaRef = personas.docs.find(doc => doc.id === currentPersona)!.ref;
                                            const interactionsCollectionRef = collection(personaRef, `Interactions`);
                                            const newInteractionDocRef = doc(interactionsCollectionRef, nanoid());

                                            await setDoc(newInteractionDocRef, {
                                                name: `Interaction #${interactions!.docs.length + 1}`,
                                                text: ``
                                            });
                                        }}>Add Interaction</Button>
                                    </div>
                                </div>

                            )}

                            {currentTab === `criticality` && (
                                <div className="grid grid-cols-3 gap-4">
                                    {criticalities?.docs.sort((a, b) => a.data().name.localeCompare(b.data().name)).map((criticality, index) => {
                                        return (
                                            <div style={{ height: `205px` }} key={index}>
                                                <TextareaCard
                                                    title={criticality.data().name}
                                                    text={criticality.data().text}
                                                    isEditing={criticalityEditingItem === criticality.id}
                                                    onEditStart={() => setCriticalityEditingItem(criticality.id)}
                                                    onEditEnd={() => setCriticalityEditingItem(undefined)}
                                                    onCommit={async (text) => {
                                                        const criticalityRef = criticalities.docs.find(doc => doc.id === criticality.id)!.ref
                                                        await updateDoc(criticalityRef, { text })
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                    <div className="flex justify-center items-center" style={{ border: `2px dashed #54A31C`, borderRadius: `6px`, height: `205px` }}>
                                        <Button block={false} type="text" onClick={async () => {
                                            const personaRef = personas.docs.find(doc => doc.id === currentPersona)!.ref;
                                            const criticalitiesCollectionRef = collection(personaRef, `Criticalities`);
                                            const newCriticalityDocRef = doc(criticalitiesCollectionRef, nanoid());

                                            await setDoc(newCriticalityDocRef, {
                                                name: `Criticality #${criticalities!.docs.length + 1}`,
                                                text: ``
                                            });
                                        }}>Add Criticality</Button>
                                    </div>
                                </div>

                            )}

                            {currentTab === `responsibilities` && (
                                <div className="grid grid-cols-3 gap-4">
                                    {responsibilities?.docs.sort((a, b) => a.data().name.localeCompare(b.data().name)).map((item, index) => {
                                        return (
                                            <div style={{ height: `205px` }} key={index}>
                                                <TextareaCard
                                                    title={item.data().name}
                                                    text={item.data().text}
                                                    isEditing={responsibilitiesEditingItem === item.id}
                                                    onEditStart={() => setResponsibilitiesEditingItem(item.id)}
                                                    onEditEnd={() => setResponsibilitiesEditingItem(undefined)}
                                                    onCommit={async (text) => {
                                                        const itemRef = responsibilities.docs.find(doc => doc.id === item.id)!.ref
                                                        await updateDoc(itemRef, { text })
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                    <div className="flex justify-center items-center" style={{ border: `2px dashed #54A31C`, borderRadius: `6px`, height: `205px` }}>
                                        <Button block={false} type="text" onClick={async () => {
                                            const personaRef = personas.docs.find(doc => doc.id === currentPersona)!.ref;
                                            const itemsCollectionRef = collection(personaRef, `Responsibilities`);
                                            const newItemRef = doc(itemsCollectionRef, nanoid());

                                            await setDoc(newItemRef, {
                                                name: `Responsibility #${responsibilities!.docs.length + 1}`,
                                                text: ``
                                            });
                                        }}>Add Responsibility</Button>
                                    </div>
                                </div>

                            )}

                            {currentTab === `priorities` && (
                                <div className="grid grid-cols-3 gap-4">
                                    {priorities?.docs.sort((a, b) => a.data().name.localeCompare(b.data().name)).map((item, index) => {
                                        return (
                                            <div style={{ height: `205px` }} key={index}>
                                                <TextareaCard
                                                    title={item.data().name}
                                                    text={item.data().text}
                                                    isEditing={prioritiesEditingItem === item.id}
                                                    onEditStart={() => setPrioritiesEditingItem(item.id)}
                                                    onEditEnd={() => setPrioritiesEditingItem(undefined)}
                                                    onCommit={async (text) => {
                                                        const itemRef = priorities.docs.find(doc => doc.id === item.id)!.ref
                                                        await updateDoc(itemRef, { text })
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                    <div className="flex justify-center items-center" style={{ border: `2px dashed #54A31C`, borderRadius: `6px`, height: `205px` }}>
                                        <Button block={false} type="text" onClick={async () => {
                                            const personaRef = personas.docs.find(doc => doc.id === currentPersona)!.ref;
                                            const itemsCollectionRef = collection(personaRef, `Priorities`);
                                            const newItemRef = doc(itemsCollectionRef, nanoid());

                                            await setDoc(newItemRef, {
                                                name: `Priority #${priorities!.docs.length + 1}`,
                                                text: ``
                                            });
                                        }}>Add Priority</Button>
                                    </div>
                                </div>

                            )}

                            {currentTab === `frustrations` && (
                                <div className="grid grid-cols-3 gap-4">
                                    {frustrations?.docs.sort((a, b) => a.data().name.localeCompare(b.data().name)).map((item, index) => {
                                        return (
                                            <div style={{ height: `205px` }} key={index}>
                                                <TextareaCard
                                                    title={item.data().name}
                                                    text={item.data().text}
                                                    isEditing={frustrationsEditingItem === item.id}
                                                    onEditStart={() => setFrustrationsEditingItem(item.id)}
                                                    onEditEnd={() => setFrustrationsEditingItem(undefined)}
                                                    onCommit={async (text) => {
                                                        const itemRef = frustrations.docs.find(doc => doc.id === item.id)!.ref
                                                        await updateDoc(itemRef, { text })
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                    <div className="flex justify-center items-center" style={{ border: `2px dashed #54A31C`, borderRadius: `6px`, height: `205px` }}>
                                        <Button block={false} type="text" onClick={async () => {
                                            const personaRef = personas.docs.find(doc => doc.id === currentPersona)!.ref;
                                            const itemsCollectionRef = collection(personaRef, `Frustrations`);
                                            const newItemRef = doc(itemsCollectionRef, nanoid());

                                            await setDoc(newItemRef, {
                                                name: `Frustration #${frustrations!.docs.length + 1}`,
                                                text: ``
                                            });
                                        }}>Add Frustration</Button>
                                    </div>
                                </div>

                            )}

                            {currentTab === `changes` && (
                                <div className="grid grid-cols-3 gap-4">
                                    {changes?.docs.sort((a, b) => a.data().name.localeCompare(b.data().name)).map((item, index) => {
                                        return (
                                            <div style={{ height: `205px` }} key={index}>
                                                <TextareaCard
                                                    title={item.data().name}
                                                    text={item.data().text}
                                                    isEditing={changesEditingItem === item.id}
                                                    onEditStart={() => setChangesEditingItem(item.id)}
                                                    onEditEnd={() => setChangesEditingItem(undefined)}
                                                    onCommit={async (text) => {
                                                        const itemRef = changes.docs.find(doc => doc.id === item.id)!.ref
                                                        await updateDoc(itemRef, { text })
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                    <div className="flex justify-center items-center" style={{ border: `2px dashed #54A31C`, borderRadius: `6px`, height: `205px` }}>
                                        <Button block={false} type="text" onClick={async () => {
                                            const personaRef = personas.docs.find(doc => doc.id === currentPersona)!.ref;
                                            const itemsCollectionRef = collection(personaRef, `Changes`);
                                            const newItemRef = doc(itemsCollectionRef, nanoid());

                                            await setDoc(newItemRef, {
                                                name: `Change #${changes!.docs.length + 1}`,
                                                text: ``
                                            });
                                        }}>Add Change</Button>
                                    </div>
                                </div>

                            )}
                        </>
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
    //[`timelines`, `Timelines`],
    [`goals`, `Goals`],
    [`interactions`, `Interactions`],
    [`criticality`, `Criticality`],
    [`responsibilities`, `Responsibilities`],
    [`priorities`, `Priorities`],
    [`frustrations`, `Frustrations`],
    [`changes`, `Changes`],
] as const
