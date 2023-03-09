"use client"

import {ClockCircleOutlined, DesktopOutlined, LayoutOutlined, MobileOutlined, TabletOutlined} from "@ant-design/icons"
import {zodResolver} from "@hookform/resolvers/zod"
import {useQueries} from "@tanstack/react-query"
import {Breadcrumb, Button, Card, Empty, Skeleton, Steps, Tag, Timeline} from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {diffArrays} from "diff"
import {Timestamp, doc, getDoc, updateDoc} from "firebase/firestore"
import {nanoid} from "nanoid"
import {useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"

import {useProduct} from "~/app/(authenticated)/useProduct"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfTextArea from "~/components/rhf/RhfTextArea"
import RhfTextListEditor from "~/components/rhf/RhfTextListEditor"
import {ProductSchema} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {trpc} from "~/utils/trpc"
import {useUser} from "~/utils/useUser"

dayjs.extend(relativeTime)

const formSchema = z.object({
	productType: ProductSchema.shape.productType.unwrap(),
	valueProposition: ProductSchema.shape.valueProposition.unwrap(),
	features: ProductSchema.shape.features.unwrap(),
	finalVision: ProductSchema.shape.finalVision,
})
type FormInputs = z.infer<typeof formSchema>

const VisionsClientPage: FC = () => {
	const user = useUser()
	const product = useProduct()

	const [editMode, setEditMode] = useState(false)
	const [currentStep, setCurrentStep] = useState(0)

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: {errors, dirtyFields},
	} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			productType: product.data().productType ?? `mobile`,
			valueProposition: product.data().valueProposition ?? ``,
			features: product.data().features ?? [{id: nanoid(), text: ``}],
		},
	})

	const hasSetInitial = useRef(false)
	useEffect(() => {
		if (hasSetInitial.current) return
		if (!product.data().finalVision) {
			reset({
				productType: product.data().productType ?? `mobile`,
				valueProposition: product.data().valueProposition ?? ``,
				features: product.data().features ?? [{id: nanoid(), text: ``}],
				finalVision: product.data().finalVision,
			})
			setEditMode(true)
			hasSetInitial.current = true
		} else if (product.data().finalVision !== ``) {
			reset({
				productType: product.data().productType ?? `mobile`,
				valueProposition: product.data().valueProposition ?? ``,
				features: product.data().features ?? [{id: nanoid(), text: ``}],
				finalVision: product.data().finalVision,
			})
			setEditMode(true)
			hasSetInitial.current = true
		}
	}, [product, reset])

	const usersData = useQueries({
		queries: product.data().updates.map((update) => ({
			queryKey: [`user`, update.userId],
			queryFn: async () => await getDoc(doc(db, `Users`, update.userId).withConverter(UserConverter)),
		})),
	})

	const [productType, valueProposition, features] = watch([`productType`, `valueProposition`, `features`])
	const productVision = trpc.gpt.useQuery(
		{
			prompt: `Write a product vision for a ${productType} app. Its goal is to: ${valueProposition}. The app has the following features: ${features
				.map((f) => f.text)
				.join(`, `)}.`,
		},
		{
			enabled: currentStep >= 3,
			select: (data) => data.response?.trim(),
		},
	)

	const scrollerRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		if (!scrollerRef.current) return
		const stepElement = document.getElementById(`step-${currentStep + 1}`)
		const headingElement = document.getElementById(`heading`)
		if (!stepElement || !headingElement) return
		scrollerRef.current.scrollTo({
			top:
				stepElement.getBoundingClientRect().top +
				scrollerRef.current.scrollTop -
				scrollerRef.current.getBoundingClientRect().top -
				headingElement.getBoundingClientRect().height -
				16,
			behavior: `smooth`,
		})
	}, [currentStep])

	return (
		<div className="grid h-full grid-cols-[2fr_16rem] gap-8">
			<div className="ml-12 mt-8 overflow-auto" ref={scrollerRef}>
				<div id="heading" className="sticky top-0 z-10 flex flex-col gap-2 bg-bgLayout pb-6">
					<Breadcrumb>
						<Breadcrumb.Item>Strategy</Breadcrumb.Item>
						<Breadcrumb.Item>Vision</Breadcrumb.Item>
					</Breadcrumb>
					<div className="leading-normal">
						<h1 className="text-3xl font-bold">Vision Statement</h1>
						<p>A concise and inspiring statement that outlines the long-term goal and purpose of a product</p>
					</div>
				</div>

				<div className="mt-1 grow pb-8">
					{editMode ? (
						<Steps
							direction="vertical"
							current={currentStep}
							items={[
								{
									title: (
										<div id="step-1" className="mb-6 flex w-full max-w-xl flex-col gap-4 leading-none">
											<div className="leading-normal">
												<p className="text-lg font-medium">Product Type</p>
												<p className="text-base text-textTertiary">How will users typically access your product?</p>
											</div>

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
												<Button type="text" disabled={!product.data().finalVision} onClick={() => setEditMode(false)}>
													Cancel
												</Button>
												<Button disabled={!!errors.productType} onClick={() => setCurrentStep(1)}>
													Next
												</Button>
											</div>
										</div>
									),
								},
								{
									title: (
										<div id="step-2" className="mb-6 flex w-full max-w-xl flex-col gap-4 leading-none">
											<div className="leading-normal">
												<p className="text-lg font-medium">Value Proposition</p>
												<p className="text-base text-textTertiary">What is the main benefit of your product?</p>
											</div>

											<RhfTextArea control={control} name="valueProposition" disabled={currentStep !== 1} />

											<div className="flex justify-end gap-4">
												<Button
													type="text"
													disabled={!product.data().finalVision || currentStep !== 1}
													onClick={() => setEditMode(false)}
												>
													Cancel
												</Button>
												<Button
													disabled={!!errors.valueProposition || !dirtyFields.valueProposition || currentStep !== 1}
													onClick={() => setCurrentStep(2)}
												>
													Next
												</Button>
											</div>
										</div>
									),
								},
								{
									title: (
										<div id="step-3" className="mb-6 flex w-full max-w-xl flex-col gap-4 leading-none">
											<div className="leading-normal">
												<p className="text-lg font-medium">Features</p>
												<p className="text-base text-textTertiary">
													What are the specific functions, tools, and capabilities?
												</p>
											</div>

											<RhfTextListEditor control={control} name="features" disabled={currentStep !== 2} />

											<div className="flex justify-end gap-4">
												<Button
													type="text"
													disabled={!product.data().finalVision || currentStep !== 2}
													onClick={() => setEditMode(false)}
												>
													Cancel
												</Button>
												<Button
													disabled={!!errors.features || !dirtyFields.features || currentStep !== 2}
													onClick={() => {
														setCurrentStep(3)
													}}
												>
													Next
												</Button>
											</div>
										</div>
									),
								},
								{
									title: (
										<div id="step-4" className="mb-6 flex w-full max-w-xl flex-col gap-4 leading-none">
											<div className="leading-normal">
												<p className="text-lg font-medium">Response</p>
												<p className="text-base text-textTertiary">Let&apos;s review what came back!</p>
											</div>

											{productVision.isSuccess && productVision.data ? (
												<Card>
													<p>{productVision.data}</p>
												</Card>
											) : productVision.isFetching ? (
												<Skeleton active />
											) : (
												<Skeleton />
											)}

											<div className="flex justify-end gap-4">
												<Button
													type="text"
													disabled={!product.data().finalVision || currentStep !== 3}
													onClick={() => setEditMode(false)}
												>
													Cancel
												</Button>
												<Button
													disabled={productVision.isFetching || currentStep !== 3}
													onClick={() => {
														setValue(`finalVision`, productVision.data ?? ``)
														setCurrentStep(4)
													}}
												>
													Next
												</Button>
											</div>
										</div>
									),
								},
								{
									title: (
										<div id="step-5" className="mb-6 flex w-full max-w-xl flex-col gap-4 leading-none">
											<div className="leading-normal">
												<p className="text-lg font-medium">Finalize</p>
												<p className="text-base text-textTertiary">
													Not a fan of any aspect? Go ahead and adjust as you see fit.
												</p>
											</div>

											{productVision.data ? (
												<RhfTextArea control={control} name="finalVision" rows={10} />
											) : (
												<Skeleton />
											)}

											<div className="flex justify-end gap-4">
												<Button
													type="text"
													disabled={!product.data().finalVision || currentStep !== 4}
													onClick={() => setEditMode(false)}
												>
													Cancel
												</Button>
												<Button
													disabled={!!errors.finalVision || currentStep !== 4}
													onClick={() => {
														handleSubmit(async (data) => {
															const operations: string[] = []

															if (product.data().productType !== data.productType)
																operations.push(`changed the product type to ${data.productType}`)

															if (product.data().valueProposition !== data.valueProposition)
																operations.push(`changed the value proposition to "${data.valueProposition}"`)

															// Calculate feature diffs
															if (product.data().features !== data.features) {
																const differences = diffArrays(
																	product.data().features?.map((feature) => feature.text) ?? [],
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

															const updates = [...product.data().updates]
															if (product.data().finalVision === ``) {
																updates.push({
																	id: nanoid(),
																	userId: user!.id,
																	text: `created the product vision.`,
																	timestamp: Timestamp.now(),
																})
															} else if (operations.length > 0) {
																updates.push({
																	id: nanoid(),
																	userId: user!.id,
																	text: operationsText,
																	timestamp: Timestamp.now(),
																})
															}

															await updateDoc(product.ref, {
																features: data.features,
																finalVision: data.finalVision,
																productType: data.productType,
																updates,
																valueProposition: data.valueProposition,
															})
															setEditMode(false)
														})().catch(console.error)
													}}
												>
													Save
												</Button>
											</div>
										</div>
									),
								},
							]}
							className="[&_.ant-steps-item-title]:w-full"
						/>
					) : product.data().finalVision ? (
						<Card
							title="Statement"
							extra={
								<Button
									size="small"
									onClick={() => {
										reset({
											productType: product.data().productType ?? `mobile`,
											valueProposition: product.data().valueProposition ?? ``,
											features: product.data().features ?? [{id: nanoid(), text: ``}],
										})
										setCurrentStep(0)
										setEditMode(true)
									}}
								>
									Edit
								</Button>
							}
						>
							<p>{product.data().finalVision}</p>
						</Card>
					) : (
						<div className="grid h-full place-items-center">
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
						</div>
					)}
				</div>
			</div>

			<div className="mt-8 mr-12 flex flex-col items-start gap-4">
				<Tag>Changelog</Tag>

				{product.data().updates.length === 0 ? (
					<p className="italic text-textTertiary">No changes yet</p>
				) : (
					<Timeline
						items={product.data().updates.map((update) => ({
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
