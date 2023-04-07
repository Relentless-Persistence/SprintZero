"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Breadcrumb, Button, Card, Empty, Skeleton, Steps, Tag, Timeline } from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { diffArrays } from "diff"
import { Timestamp, collection, doc, writeBatch } from "firebase/firestore"
import { nanoid } from "nanoid"
import { useEffect, useRef, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { FC } from "react"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import RhfSelect from "~/components/rhf/RhfSelect"
import RhfTextArea from "~/components/rhf/RhfTextArea"
import RhfTextListEditor from "~/components/rhf/RhfTextListEditor"
import { ProductSchema, productTypes as productTypesEnum } from "~/types/db/Products"
import { FeatureConverter, FeatureSchema } from "~/types/db/Products/Features"
import { MemberConverter } from "~/types/db/Products/Members"
import { VisionUpdateConverter } from "~/types/db/Products/VisionUpdates"
import { db } from "~/utils/firebase"
import { trpc } from "~/utils/trpc"

dayjs.extend(relativeTime)

const formSchema = z.object({
	productTypes: ProductSchema.shape.productTypes,
	valueProposition: ProductSchema.shape.valueProposition.unwrap(),
	features: z.array(z.object({ id: z.string(), text: FeatureSchema.shape.text })),
	finalVision: ProductSchema.shape.finalVision,
})
type FormInputs = z.infer<typeof formSchema>

const VisionsClientPage: FC = () => {
	const { product, user } = useAppContext()

	const [editMode, setEditMode] = useState(false)
	const [currentStep, setCurrentStep] = useState(0)

	const [dbFeatures, , dbFeaturesError] = useCollection(
		collection(product.ref, `Features`).withConverter(FeatureConverter),
	)
	useErrorHandler(dbFeaturesError)

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		trigger,
		formState: { errors },
	} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
	})

	const hasSetInitial = useRef(false)
	useEffect(() => {
		if (hasSetInitial.current) return
		if (!product.data().finalVision) {
			reset({
				productTypes: product.data().productTypes,
				valueProposition: product.data().valueProposition ?? ``,
				features: dbFeatures?.docs.map((feature) => ({ id: feature.id, text: feature.data().text })) ?? [
					{ id: nanoid(), text: `` },
				],
				finalVision: product.data().finalVision,
			})
			setEditMode(true)
			hasSetInitial.current = true
		}
	}, [dbFeatures?.docs, product, reset])

	const [visionUpdates, , visionUpdatesError] = useCollection(
		collection(product.ref, `VisionUpdates`).withConverter(VisionUpdateConverter),
	)
	useErrorHandler(visionUpdatesError)
	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	useErrorHandler(membersError)

	const [productTypes, valueProposition, features] = watch([`productTypes`, `valueProposition`, `features`])
	const gpt = trpc.gpt.useMutation()
	const [productVision, setProductVision] = useState<string | undefined>(undefined)

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
					<Breadcrumb items={[{ title: `Strategy` }, { title: `Vision` }]} />
					<div className="leading-normal">
						<h1 className="text-3xl font-bold">Vision Statement</h1>
						<p className="text-textTertiary">
							A concise and inspiring statement that outlines the long-term goal and purpose of a product
						</p>
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

											<RhfSelect
												control={control}
												name="productTypes"
												mode="multiple"
												disabled={currentStep !== 0}
												className="w-full"
												options={[
													{ label: `Mobile`, value: `mobile` },
													{ label: `Tablet`, value: `tablet` },
													{ label: `Desktop`, value: `desktop` },
													{ label: `Watch`, value: `watch` },
													{ label: `Web`, value: `web` },
													{ label: `Augmented Reality`, value: `augmentedReality` },
													{ label: `Virtual Reality`, value: `virtualReality` },
													{ label: `Artificial Intelligence`, value: `artificialIntelligence` },
													{ label: `Humanoid`, value: `humanoid` },
													{ label: `API`, value: `api` },
												]}
											/>

											<div className="flex justify-end gap-4">
												<Button type="text" disabled={!product.data().finalVision} onClick={() => setEditMode(false)}>
													Cancel
												</Button>
												<Button disabled={!!errors.productTypes || currentStep !== 0} onClick={() => setCurrentStep(1)}>
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
													disabled={!!errors.valueProposition || currentStep !== 1}
													onClick={() => {
														trigger(`valueProposition`)
															.then((allowed) => {
																if (allowed) setCurrentStep(2)
															})
															.catch(console.error)
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
													disabled={!!errors.features || currentStep !== 2}
													onClick={() => {
														gpt
															.mutateAsync({
																prompt: `Write a product vision for a ${listToSentence(
																	productTypes.map((type) => productTypesEnum.find((t) => t[0] === type)![1]),
																)} app. Its goal is to: ${valueProposition}. The app has the following features: ${features.join(
																	`, `,
																)}.`,
															})
															.then((data) => {
																setProductVision(data.response?.trim())
																setCurrentStep(3)
															})
															.catch(console.error)
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

											{gpt.isSuccess ? (
												<Card>
													<p>{productVision}</p>
												</Card>
											) : gpt.isLoading ? (
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
													disabled={gpt.isLoading || currentStep !== 3}
													onClick={() => {
														setValue(`finalVision`, productVision ?? ``)
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

											{gpt.data ? <RhfTextArea control={control} name="finalVision" rows={10} /> : <Skeleton />}

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

															if (product.data().valueProposition !== data.valueProposition)
																operations.push(`changed the value proposition to "${data.valueProposition}"`)

															// Calculate feature diffs
															if (
																dbFeatures?.docs.map((feature) => ({ id: feature.id, text: feature.data().text })) !==
																data.features
															) {
																const differences = diffArrays(
																	dbFeatures?.docs.map((feature) => feature.data().text) ?? [],
																	data.features.map((feature) => feature.text),
																)
																const removals = differences
																	.filter((difference) => difference.removed)
																	.flatMap((difference) => difference.value)
																	.map((removal) => `"${removal}"`)
																let removalsText = removals.length > 0 ? listToSentence(removals) : undefined
																removalsText = removalsText
																	? `removed the feature${removals.length === 1 ? `` : `s`} ${removalsText}`
																	: undefined
																if (removalsText) operations.push(removalsText)
																const additions = differences
																	.filter((difference) => difference.added)
																	.flatMap((difference) => difference.value)
																	.map((addition) => `"${addition}"`)
																let additionsText = additions.length > 0 ? listToSentence(additions) : undefined
																additionsText = additionsText
																	? `added the feature${additions.length === 1 ? `` : `s`} ${additionsText}`
																	: undefined
																if (additionsText) operations.push(additionsText)
															}

															const operationsText = listToSentence(operations).concat(`.`)

															const batch = writeBatch(db)
															if (product.data().finalVision === ``) {
																batch.set(
																	doc(product.ref, `VisionUpdates`, nanoid()).withConverter(VisionUpdateConverter),
																	{
																		userId: user.id,
																		text: `created the product vision.`,
																		timestamp: Timestamp.now(),
																	},
																)
															} else if (operations.length > 0) {
																batch.set(
																	doc(product.ref, `VisionUpdates`, nanoid()).withConverter(VisionUpdateConverter),
																	{
																		userId: user.id,
																		text: operationsText,
																		timestamp: Timestamp.now(),
																	},
																)
															}

															batch.update(product.ref, {
																finalVision: data.finalVision,
																productTypes: data.productTypes,
																valueProposition: data.valueProposition,
															})
															features.forEach((feature) => {
																batch.set(doc(product.ref, `Features`, feature.id).withConverter(FeatureConverter), {
																	text: feature.text,
																})
															})
															await batch.commit()

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
											productTypes: product.data().productTypes,
											valueProposition: product.data().valueProposition ?? ``,
											features: dbFeatures?.docs.map((feature) => ({ id: feature.id, text: feature.data().text })) ?? [
												{ id: nanoid(), text: `` },
											],
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

				{visionUpdates?.docs.length === 0 ? (
					<p className="italic text-textTertiary">No changes yet</p>
				) : (
					<Timeline
						items={visionUpdates?.docs.map((update) => ({
							children: members && (
								<div className="flex flex-col gap-1">
									<p className="font-mono">{dayjs(update.data().timestamp.toDate()).fromNow()}</p>
									<p className="text-xs">
										<span className="text-info">
											@{members.docs.find((member) => member.id === update.data().userId)?.data()?.name}
										</span>
										{` `}
										{update
											.data()
											.text.split(`"`)
											.map((text, i) =>
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
