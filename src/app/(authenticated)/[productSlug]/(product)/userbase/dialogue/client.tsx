"use client"

import {EyeOutlined, PhoneOutlined, PlusOutlined, SoundOutlined, UserOutlined} from "@ant-design/icons"
import {Avatar, Breadcrumb, Button, Card, Empty, FloatButton, Spin, Tabs, Tag} from "antd"
import {Timestamp, addDoc, collection} from "firebase/firestore"
import {useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"

import ParticipantDrawer from "./ParticipantDrawer"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {DialogueParticipantConverter} from "~/types/db/Products/DialogueParticipants"
import {PersonaConverter} from "~/types/db/Products/Personas"
import BoneIcon from "~public/icons/bone.svg"
import CognitionIcon from "~public/icons/cognition.svg"
import EarIcon from "~public/icons/ear.svg"

const DialogueClientPage: FC = () => {
	const {product, user} = useAppContext()
	const [currentTab, setCurrentTab] = useState<(typeof tabs)[number][0]>(`identified`)
	const [activeParticipant, setActiveParticipant] = useState<string | undefined>(undefined)

	const [participants, , participantsError] = useCollection(
		collection(product.ref, `DialogueParticipants`).withConverter(DialogueParticipantConverter),
	)
	useErrorHandler(participantsError)
	const [personas, , personasError] = useCollection(collection(product.ref, `Personas`).withConverter(PersonaConverter))
	useErrorHandler(personasError)

	return (
		<div className="grid h-full grid-cols-[1fr_auto]">
			<div className="relative flex flex-col gap-4 overflow-auto px-12 py-8">
				<Breadcrumb
					items={[{title: `Userbase`}, {title: `Dialogue`}, {title: tabs.find(([key]) => key === currentTab)![1]}]}
				/>

				{participants ? (
					participants.docs.length === 0 ? (
						<div className="grid grow place-items-center">
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
						</div>
					) : (
						<Masonry
							breakpointCols={{default: 4, 1700: 3, 1300: 2, 1000: 1}}
							className="flex gap-8"
							columnClassName="flex flex-col gap-8"
						>
							{participants.docs
								.filter((participant) => participant.data().status === currentTab)
								.map((participant) => {
									return (
										<Card
											key={participant.id}
											type="inner"
											title={
												<div className="my-4 mr-2 flex items-center gap-4">
													<Avatar icon={<UserOutlined />} shape="square" size="large" />
													<div className="min-w-0 flex-1">
														<p className="truncate">{participant.data().name}</p>
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
												{personas?.docs.map((persona) => (
													<Tag key={persona.id} color="geekblue" icon={<UserOutlined />}>
														{persona.data().name}
													</Tag>
												))}
												{participant.data().disabilities.auditory && (
													<Tag
														color="gold"
														icon={<EarIcon className="mr-1.5 inline-block" />}
														className="flex items-center"
													>
														Auditory
													</Tag>
												)}
												{participant.data().disabilities.cognitive && (
													<Tag
														color="gold"
														icon={<CognitionIcon className="mr-1.5 inline-block" />}
														className="flex items-center"
													>
														Cognitive
													</Tag>
												)}
												{participant.data().disabilities.physical && (
													<Tag
														color="gold"
														icon={<BoneIcon className="mr-1.5 inline-block stroke-current" />}
														className="flex items-center"
													>
														Physical
													</Tag>
												)}
												{participant.data().disabilities.speech && (
													<Tag
														color="gold"
														icon={<SoundOutlined className="inline-block" />}
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
												{participant.data().phoneNumber && (
													<Tag color="red" icon={<PhoneOutlined />}>
														{participant.data().phoneNumber}
													</Tag>
												)}
											</div>
										</Card>
									)
								})}
						</Masonry>
					)
				) : (
					<Spin />
				)}

				<FloatButton
					icon={<PlusOutlined className="text-primary" />}
					tooltip="Add Participant"
					onClick={() => {
						addDoc(collection(product.ref, `DialogueParticipants`).withConverter(DialogueParticipantConverter), {
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
							personaId: null,
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
