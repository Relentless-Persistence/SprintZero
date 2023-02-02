"use client"

import {useQueries} from "@tanstack/react-query"
import {Button, Tag, Timeline, Breadcrumb, Card, Steps} from "antd"
import {formatDistanceToNow} from "date-fns"
import {doc, getDoc, Timestamp} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"

import FinalStep from "./FinalStep"
import ResponseStep from "./ResponseStep"
import StatementStep from "./StatementStep"
import NoData from "~/components/NoData"
import {ProductConverter, Products} from "~/types/db/Products"
import {UserConverter, Users} from "~/types/db/Users"
import {auth, db} from "~/utils/firebase"
import {updateProduct} from "~/utils/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const VisionsPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))
	const [user] = useAuthState(auth)

	const [editMode, setEditMode] = useState(false)
	const [currentStep, setCurrentStep] = useState(0)
	const [gptResponse, setGptResponse] = useState<string | undefined>(undefined)
	const [gptResponseAccepted, setGptResponseAccepted] = useState(false)

	const usersData = useQueries({
		queries:
			activeProduct?.updates.map((update) => ({
				queryKey: [`user`, update.userId],
				queryFn: async () => (await getDoc(doc(db, Users._, update.userId).withConverter(UserConverter))).data(),
			})) ?? [],
	})

	return (
		<div className="flex h-full flex-col gap-6 px-12 pt-8">
			<Breadcrumb>
				<Breadcrumb.Item>Strategy</Breadcrumb.Item>
				<Breadcrumb.Item>Vision</Breadcrumb.Item>
			</Breadcrumb>

			<div className="grid min-h-0 flex-1 grid-cols-[1fr_16rem] gap-8">
				<div className="space-y-6 overflow-auto pb-8">
					<div className="flex items-start justify-between">
						<div className="space-y-2">
							<h1 className="text-4xl font-semibold">Product Vision</h1>
							{editMode && (
								<h2 className="text-laurel">
									We leverage OpenAI&apos;s GPT Models to assist. Fill in below to get started.
								</h2>
							)}
						</div>

						<Button className="bg-white hover:text-black" disabled={editMode} onClick={() => setEditMode(true)}>
							Edit
						</Button>
					</div>

					<div>
						{editMode && (
							<Steps
								direction="vertical"
								current={currentStep}
								onChange={(value) => void setCurrentStep(value)}
								items={[
									{
										title: (
											<StatementStep
												onFinish={(gptResponse) => {
													setGptResponse(gptResponse)
													setCurrentStep(1)
												}}
											/>
										),
									},
									{
										title: (
											<ResponseStep
												gptResponse={gptResponse}
												setGptResponse={(newResponse) => void setGptResponse(newResponse)}
												onFinish={() => {
													setGptResponseAccepted(true)
													setCurrentStep(2)
												}}
											/>
										),
									},
									{
										title: (
											<FinalStep
												gptResponse={gptResponseAccepted ? gptResponse : undefined}
												onFinish={async (finalVision) => {
													const newProduct = produce(activeProduct!, (draft) => {
														if (draft.finalVision === ``) {
															draft.updates.push({
																id: nanoid(),
																userId: user!.uid as Id,
																text: `created the product vision.`,
																timestamp: Timestamp.now(),
															})
														}
														draft.finalVision = finalVision
													})
													await updateProduct({id: activeProduct!.id, data: newProduct})
													setEditMode(false)
												}}
												onCancel={() => void setEditMode(false)}
											/>
										),
									},
								]}
								className="[&_.ant-steps-item-title]:w-full"
							/>
						)}
						{!editMode && activeProduct?.finalVision && (
							<Card
								className="border border-[#D9D9D9]"
								style={{boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.08), 1px -4px 4px rgba(0, 0, 0, 0.06)`}}
							>
								<p>{activeProduct.finalVision}</p>
							</Card>
						)}
						{!editMode && !activeProduct?.finalVision && (
							<div className="grid place-items-center">
								<NoData />
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-col items-start gap-4">
					<Tag color="#eefcd9" className="border !border-[#d3dec1] text-xs !text-black">
						Changelog
					</Tag>

					<Timeline>
						{!activeProduct?.updates || activeProduct.updates.length === 0 ? (
							<Timeline.Item color="#54A31C">No Changes Yet</Timeline.Item>
						) : (
							activeProduct.updates.map((update, i) => (
								<Timeline.Item color="#54A31C" key={i}>
									<div className="space-y-1">
										<p className="font-mono">{formatDistanceToNow(update.timestamp.toDate(), {addSuffix: true})}</p>
										<p className="text-xs">
											<span className="text-[#1890ff]">
												@{usersData.find((user) => user.data?.id === update.userId)?.data?.name}
											</span>
											{` `}
											{update.text.split(`"`).map((text, i) =>
												i % 2 === 0 ? (
													<span key={i}>{text}</span>
												) : (
													<b key={i} className="font-semibold">
														&quot;{text}&quot;
													</b>
												),
											)}
										</p>
									</div>
								</Timeline.Item>
							))
						)}
					</Timeline>
				</div>
			</div>
		</div>
	)
}

export default VisionsPage