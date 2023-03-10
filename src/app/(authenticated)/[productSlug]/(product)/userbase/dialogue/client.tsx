"use client"

import {EyeOutlined, PhoneOutlined, PlusOutlined, UserOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Breadcrumb, Button, Card, FloatButton, Tabs, Tag} from "antd"
import {Timestamp, addDoc, collection, doc, getDoc} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"

import ParticipantDrawer from "./ParticipantDrawer"
import {useAppContext} from "~/app/(authenticated)/AppContext"
import {ParticipantConverter} from "~/types/db/Products/Participants"
import {PersonaConverter} from "~/types/db/Products/Personas"
import {db} from "~/utils/firebase"
import EarIcon from "~public/icons/ear.svg"

const DialogueClientPage: FC = () => {
	const {product, user} = useAppContext()
	const [currentTab, setCurrentTab] = useState<(typeof tabs)[number][0]>(`identified`)
	const [activeParticipant, setActiveParticipant] = useState<string | undefined>(undefined)

	const [participants] = useCollection(collection(product.ref, `Participants`).withConverter(ParticipantConverter))

	const allPersonas = useQueries({
		queries: participants
			? participants.docs
					.flatMap((participant) => participant.data().personaIds)
					.map((personaId) => ({
						queryKey: [`persona`, personaId],
						queryFn: async () => await getDoc(doc(db, `Personas`, personaId).withConverter(PersonaConverter)),
					}))
			: [],
	})

	return (
		<div className="grid h-full grid-cols-[1fr_auto]">
			<div className="relative flex flex-col gap-4 overflow-auto px-12 py-8">
				<Breadcrumb>
					<Breadcrumb.Item>Userbase</Breadcrumb.Item>
					<Breadcrumb.Item>Dialogue</Breadcrumb.Item>
					<Breadcrumb.Item>{tabs.find(([key]) => key === currentTab)![1]}</Breadcrumb.Item>
				</Breadcrumb>

				<Masonry
					breakpointCols={{default: 4, 1700: 3, 1300: 2, 1000: 1}}
					className="flex gap-8"
					columnClassName="flex flex-col gap-8"
				>
					{participants?.docs
						.filter((participant) => participant.data().status === currentTab)
						.map((participant) => {
							const personas = allPersonas
								.filter(({data: persona}) => persona && participant.data().personaIds.includes(persona.id))
								.map((persona) => persona.data)

							return (
								<Card
									key={participant.id}
									type="inner"
									title={
										<div className="my-4 flex items-center gap-4">
											<Avatar icon={<UserOutlined />} shape="square" size="large" />
											<div>
												<p>{participant.data().name}</p>
												{participant.data().location && (
													<p className="font-normal text-textTertiary">{participant.data().location}</p>
												)}
											</div>
										</div>
									}
									extra={
										<Button size="small" onClick={() => setActiveParticipant(participant.id)}>
											View
										</Button>
									}
								>
									<div className="flex flex-wrap gap-2">
										{personas.map((persona) => (
											<Tag key={persona?.id} color="geekblue" icon={<UserOutlined />}>
												{persona?.data()?.name}
											</Tag>
										))}
										{participant.data().disabilities.auditory && (
											<Tag color="gold" icon={<EarIcon className="inline-block" />} className="flex items-center">
												Auditory
											</Tag>
										)}
										{participant.data().disabilities.cognitive && (
											<Tag
												color="gold"
												icon={<EarIcon className="inline-block stroke-current" />}
												className="flex items-center"
											>
												Cognitive
											</Tag>
										)}
										{participant.data().disabilities.physical && (
											<Tag
												color="gold"
												icon={<EarIcon className="inline-block stroke-current" />}
												className="flex items-center"
											>
												Physical
											</Tag>
										)}
										{participant.data().disabilities.speech && (
											<Tag
												color="gold"
												icon={<EarIcon className="inline-block stroke-current" />}
												className="flex items-center"
											>
												Speech
											</Tag>
										)}
										{participant.data().disabilities.visual && (
											<Tag color="gold" icon={<EyeOutlined />} className="flex items-center">
												Visual
											</Tag>
										)}
										<Tag color="red" icon={<PhoneOutlined />}>
											{participant.data().phoneNumber}
										</Tag>
									</div>
								</Card>
							)
						})}
				</Masonry>

				<FloatButton
					icon={<PlusOutlined className="text-primary" />}
					tooltip="Add Participant"
					onClick={() => {
						addDoc(collection(db, `Participants`).withConverter(ParticipantConverter), {
							availability: [],
							disabilities: {
								auditory: false,
								cognitive: false,
								physical: false,
								speech: false,
								visual: false,
							},
							email: null,
							location: ``,
							name: `New Participant`,
							phoneNumber: ``,
							status: `identified`,
							timing: null,
							title: null,
							transcript: ``,
							updatedAt: Timestamp.now(),
							personaIds: [],
							updatedAtUserId: user.id,
						})
							.then((docRef) => {
								setActiveParticipant(docRef.id)
							})
							.catch(console.error)
					}}
					className="absolute bottom-8 right-12"
				/>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentTab}
				onChange={(tab: (typeof tabs)[number][0]) => setCurrentTab(tab)}
				className="h-full"
				items={tabs.map(([key, label]) => ({key, label}))}
			/>

			{activeParticipant !== undefined && (
				<ParticipantDrawer
					participants={participants}
					activeParticipant={activeParticipant}
					onClose={() => setActiveParticipant(undefined)}
				/>
			)}
		</div>
	)
}

export default DialogueClientPage

const tabs = [
	[`identified`, `Identified`],
	[`contacted`, `Contacted`],
	[`scheduled`, `Scheduled`],
	[`interviewed`, `Interviewed`],
	[`analyzing`, `Analyzing`],
	[`processed`, `Processed`],
] as const
