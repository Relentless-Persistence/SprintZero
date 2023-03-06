"use client"

import {ClockCircleOutlined, DesktopOutlined, LayoutOutlined, MobileOutlined, TabletOutlined} from "@ant-design/icons"
import {zodResolver} from "@hookform/resolvers/zod"
import {useQueries} from "@tanstack/react-query"
import {Breadcrumb, Button, Card, Empty, Skeleton, Steps, Tag, Timeline, notification} from "antd"
import axios from "axios"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {diffArrays} from "diff"
import {Timestamp, doc, getDoc, updateDoc} from "firebase/firestore"
import {nanoid} from "nanoid"
import {useEffect, useRef, useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"
import type {Id} from "~/types"

import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfTextArea from "~/components/rhf/RhfTextArea"
import RhfTextListEditor from "~/components/rhf/RhfTextListEditor"
import {ProductConverter, ProductSchema} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"
import {useUser} from "~/utils/useUser"

dayjs.extend(relativeTime)

const formSchema = z.object({
	productType: ProductSchema.shape.productType,
	valueProposition: ProductSchema.shape.valueProposition.unwrap(),
	features: ProductSchema.shape.features.unwrap(),
	finalVision: ProductSchema.shape.finalVision,
})
type FormInputs = z.infer<typeof formSchema>

const VisionsClientPage: FC = () => {
	const activeProductId = useActiveProductId()
	const user = useUser()
	const [activeProduct] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const [editMode, setEditMode] = useState(false)
	const [currentStep, setCurrentStep] = useState(0)
	const [rawVision, setRawVision] = useState<string | undefined>(undefined)

	const {
		control,
		handleSubmit,
		getValues,
		setValue,
		reset,
		formState: {errors},
	} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			productType: activeProduct?.productType ?? `mobile`,
			valueProposition: activeProduct?.valueProposition ?? ``,
			features: activeProduct?.features ?? [{id: nanoid() as Id, text: ``}],
		},
	})

	const hasSetInitial = useRef(false)
	useEffect(() => {
		if (hasSetInitial.current) return
		if (activeProduct && !activeProduct.finalVision) {
			reset({
				productType: activeProduct.productType,
				valueProposition: activeProduct.valueProposition ?? ``,
				features: activeProduct.features ?? [{id: nanoid() as Id, text: ``}],
				finalVision: activeProduct.finalVision,
			})
			setEditMode(true)
			hasSetInitial.current = true
		} else if (activeProduct && activeProduct.finalVision.length > 0) {
			reset({
				productType: activeProduct.productType,
				valueProposition: activeProduct.valueProposition ?? ``,
				features: activeProduct.features ?? [{id: nanoid() as Id, text: ``}],
				finalVision: activeProduct.finalVision
			})
			setEditMode(true)
			hasSetInitial.current = true
		}
	}, [activeProduct, reset])

	const usersData = useQueries({
		queries:
			activeProduct?.updates.map((update) => ({
				queryKey: [`user`, update.userId],
				queryFn: async () => await getDoc(doc(db, `Users`, update.userId).withConverter(UserConverter)),
			})) ?? [],
	})

	type ProductVisionInput = {
		productType: string
		valueProposition: string
		features: string[]
	}

	const generateProductVision = async ({productType, valueProposition, features}: ProductVisionInput) => {
		const gptQuestion = `Write a product vision for a ${productType} app. Its goal is to: ${valueProposition}. The app has the following features: ${features.join(
			`, `,
		)}.`

		let gptResponse = ``
		try {
			const _res = await axios.post(`/api/gpt`, {prompt: gptQuestion})
			const {response: res} = z.object({response: z.string()}).parse(_res.data)
			gptResponse = res.trimStart()
		} catch (error) {
			console.error(error)
			notification.error({message: `Something went wrong!`})
		}

		return gptResponse
	}

	return (
		<div className="grid h-full grid-cols-[2fr_16rem] gap-8">
			<div className="ml-12 mt-8 overflow-auto">
				<div className="sticky top-0 z-10 bg-bgLayout pb-8">
					<Breadcrumb>
						<Breadcrumb.Item>Strategy</Breadcrumb.Item>
						<Breadcrumb.Item>Vision</Breadcrumb.Item>
					</Breadcrumb>

					<p className="mt-2">Outline the long-term goals and purpose of your product</p>
				</div>

				<div className="flex flex-col gap-6 overflow-auto pb-8">
					<div className="grow">
						{editMode ? (
							<Steps
								direction="vertical"
								current={currentStep}
								items={[
									{
										title: (
											<div className="mb-8 flex w-full flex-col gap-6">
												<div className="flex flex-col gap-2">
													<p className="text-lg leading-none">Application Type</p>
													<p className="text-base leading-none text-textTertiary">
														How will users typically access your product?
													</p>
												</div>

												<Card className="max-w-2xl">
													<div className="flex flex-col gap-4">
														<RhfSegmented
															control={control}
															name="productType"
															block
															options={[
																{icon: <MobileOutlined />, label: `Mobile`, value: `mobile`},
																{icon: <TabletOutlined />, label: `Tablet`, value: `tablet`},
																{icon: <DesktopOutlined />, label: `Desktop`, value: `desktop`},
																{icon: <ClockCircleOutlined />, label: `Watch`, value: `watch`},
																{icon: <LayoutOutlined />, label: `Web`, value: `web`},
															]}
														/>

														<div className="flex justify-end gap-4">
															<Button
																type="text"
																disabled={!activeProduct?.finalVision}
																onClick={() => setEditMode(false)}
															>
																Cancel
															</Button>
															<Button disabled={!!errors.productType} onClick={() => setCurrentStep(1)}>
																Next
															</Button>
														</div>
													</div>
												</Card>
											</div>
										),
									},
									{
										title: (
											<div className="mb-6 flex w-full flex-col gap-6">
												<div className="flex flex-col gap-2">
													<p className="text-lg leading-none">Value Proposition</p>
													<p className="text-base leading-none text-textTertiary">
														What is the main benefit of your product?
													</p>
												</div>

												<Card className="max-w-2xl">
													<div className="flex flex-col gap-4">
														<RhfTextArea control={control} name="valueProposition" disabled={currentStep !== 1} />

														<div className="flex justify-end gap-4">
															<Button
																type="text"
																disabled={!activeProduct?.finalVision || currentStep !== 1}
																onClick={() => setEditMode(false)}
															>
																Cancel
															</Button>
															<Button
																disabled={!!errors.valueProposition || currentStep !== 1}
																onClick={() => setCurrentStep(2)}
															>
																Next
															</Button>
														</div>
													</div>
												</Card>
											</div>
										),
									},
									{
										title: (
											<div className="mb-6 flex w-full flex-col gap-6">
												<div className="flex flex-col gap-2">
													<p className="text-lg leading-none">Features</p>
													<p className="text-base leading-none text-textTertiary">
														What are the specific functions, tools, and capabilities?
													</p>
												</div>

												<Card className="max-w-2xl">
													<div className="flex flex-col gap-4">
														<RhfTextListEditor control={control} name="features" disabled={currentStep !== 2} />

														<div className="flex justify-end gap-4">
															<Button
																type="text"
																disabled={!activeProduct?.finalVision || currentStep !== 2}
																onClick={() => setEditMode(false)}
															>
																Cancel
															</Button>
															<Button
																disabled={!!errors.features || currentStep !== 2}
																onClick={() => {
																	setCurrentStep(3)
																	setRawVision(`waiting`)
																	const {productType, valueProposition, features} = getValues()
																	generateProductVision({
																		productType,
																		valueProposition,
																		features: features.map((f) => f.text),
																	})
																		.then((response) => {
																			setRawVision(response)
																			setValue(`finalVision`, response)
																		})
																		.catch(console.error)
																}}
															>
																Next
															</Button>
														</div>
													</div>
												</Card>
											</div>
										),
									},
									{
										title: (
											<div className="mb-6 flex w-full flex-col gap-6">
												<div className="flex flex-col gap-2">
													<p className="text-lg leading-none">Response</p>
													<p className="text-base leading-none text-textTertiary">Let&apos;s review what came back!</p>
												</div>

												<Card className="max-w-2xl">
													<div className="flex flex-col gap-4">
														{rawVision === undefined ? (
															<Skeleton />
														) : rawVision === `waiting` ? (
															<Skeleton active />
														) : (
															<p>{rawVision}</p>
														)}

														<div className="flex justify-end gap-4">
															<Button
																type="text"
																disabled={!activeProduct?.finalVision || currentStep !== 3}
																onClick={() => setEditMode(false)}
															>
																Cancel
															</Button>
															<Button
																disabled={rawVision === undefined || rawVision === `waiting`}
																onClick={() => setCurrentStep(4)}
															>
																Next
															</Button>
														</div>
													</div>
												</Card>
											</div>
										),
									},
									{
										title: (
											<div className="mb-6 flex w-full flex-col gap-6">
												<div className="flex flex-col gap-2">
													<p className="text-lg leading-none">Finalize</p>
													<p className="text-base leading-none text-textTertiary">
														Not a fan of any aspect? Go ahead and adjust as you see fit.
													</p>
												</div>

												<Card className="max-w-2xl">
													<div className="flex flex-col gap-4">
														{rawVision !== `waiting` && activeProduct?.finalVision !== `` ? (
															<RhfTextArea control={control} name="finalVision" rows={10} />
														) : (
															<Skeleton />
														)}

														<div className="flex justify-end gap-4">
															<Button
																type="text"
																disabled={!activeProduct?.finalVision || currentStep !== 4}
																onClick={() => setEditMode(false)}
															>
																Cancel
															</Button>
															<Button
																disabled={!!errors.finalVision || currentStep !== 4}
																onClick={() => {
																	handleSubmit(async (data) => {
																		if (!activeProduct) return

																		const operations: string[] = []

																		if (activeProduct.productType !== data.productType)
																			operations.push(`changed the product type to ${data.productType}`)

																		if (activeProduct.valueProposition !== data.valueProposition)
																			operations.push(`changed the value proposition to "${data.valueProposition}"`)

																		if (activeProduct.features !== data.features) {
																			const differences = diffArrays(
																				activeProduct.features?.map((feature) => feature.text) ?? [],
																				data.features.map((feature) => feature.text),
																			)
																			const removals = differences
																				.filter((difference) => difference.removed)
																				.flatMap((difference) => difference.value)
																				.map((removal) => `"${removal}"`)
																			let removalsText = removals.length > 0 ? listToSentence(removals) : undefined
																			removalsText = removalsText ? `removed the features ${removalsText}` : undefined
																			if (removalsText) operations.push(removalsText)
																			const additions = differences
																				.filter((difference) => difference.added)
																				.flatMap((difference) => difference.value)
																				.map((addition) => `"${addition}"`)
																			let additionsText = additions.length > 0 ? listToSentence(additions) : undefined
																			additionsText = additionsText ? `added the features ${additionsText}` : undefined
																			if (additionsText) operations.push(additionsText)
																		}
																		const operationsText = listToSentence(operations).concat(`.`)

																		const updates = [...activeProduct.updates]
																		if (activeProduct.finalVision === ``) {
																			updates.push({
																				id: nanoid(),
																				userId: user!.id as Id,
																				text: `created the product vision.`,
																				timestamp: Timestamp.now(),
																			})
																		} else if (operations.length > 0) {
																			updates.push({
																				id: nanoid(),
																				userId: user!.id as Id,
																				text: operationsText,
																				timestamp: Timestamp.now(),
																			})
																		}

																		await updateDoc(
																			doc(db, `Products`, activeProductId).withConverter(ProductConverter),
																			{
																				features: data.features,
																				finalVision: data.finalVision,
																				productType: data.productType,
																				updates,
																				valueProposition: data.valueProposition,
																			},
																		)
																		setEditMode(false)
																	})().catch(console.error)
																}}
															>
																Save
															</Button>
														</div>
													</div>
												</Card>
											</div>
										),
									},
								]}
								className="[&_.ant-steps-item-title]:w-full"
							/>
						) : activeProduct?.finalVision ? (
							<Card
								title="Statement"
								extra={
									<Button
										type="text"
										className="text-primary"
										onClick={() => {
											reset({
												productType: activeProduct.productType,
												valueProposition: activeProduct.valueProposition ?? ``,
												features: activeProduct.features ?? [{id: nanoid() as Id, text: ``}],
											})
											setCurrentStep(0)
											setEditMode(true)
										}}
									>
										Edit
									</Button>
								}
							>
								<p>{activeProduct.finalVision}</p>
							</Card>
						) : (
							<div className="grid h-full place-items-center">
								<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="mt-8 mr-12 flex flex-col items-start gap-4">
				<Tag>Changelog</Tag>

				{!activeProduct?.updates || activeProduct.updates.length === 0 ? (
					<p className="italic text-textTertiary">No changes yet</p>
				) : (
					<Timeline
						items={activeProduct.updates.map((update) => ({
							children: (
								<div className="flex flex-col gap-1">
									<p className="font-mono">{dayjs(update.timestamp.toDate()).fromNow()}</p>
									<p className="text-xs">
										<span className="text-info">
											@{usersData.find((user) => user.data?.id === update.userId)?.data?.data()?.name}
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
							),
						}))}
					/>
				)}
			</div>
		</div>
	)
}

export default VisionsClientPage

const listToSentence = (list: string[]) => {
	if (list.length === 0) return ``
	if (list.length === 1) return list[0]!
	const last = list.pop()!
	return `${list.join(`, `)}${list.length > 1 ? `,` : ``} and ${last}`
}
