import {
	BlockOutlined,
	CodeOutlined,
	DislikeOutlined,
	DollarOutlined,
	FlagOutlined,
	LikeOutlined,
	LinkOutlined,
	NumberOutlined,
} from "@ant-design/icons"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button, Drawer, Form, Input, Radio, Tag} from "antd"
import clsx from "clsx"
import {collection, setDoc} from "firebase/firestore"
import produce from "immer"
import {useEffect, useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import {useCollection} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {z} from "zod"
import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"
import type {Story, StoryMapState} from "~/types/db/StoryMapStates"

import Comments from "~/components/Comments"
import LinkTo from "~/components/LinkTo"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfSelect from "~/components/rhf/RhfSelect"
import {StorySchema, sprintColumns} from "~/types/db/StoryMapStates"
import {VersionConverter} from "~/types/db/Versions"
import dollarFormat from "~/utils/dollarFormat"
import {auth, db} from "~/utils/firebase"
import {formValidateStatus} from "~/utils/formValidateStatus"
import {getStories} from "~/utils/storyMap"

const formSchema = StorySchema.pick({
	branchName: true,
	designLink: true,
	name: true,
	pageLink: true,
	points: true,
	sprintColumn: true,
	versionId: true,
})
type FormInputs = z.infer<typeof formSchema>

export type StoryDrawerProps = {
	activeProduct: QueryDocumentSnapshot<Product>
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	storyId: Id
	isOpen: boolean
	onClose: () => void
}

const StoryDrawer: FC<StoryDrawerProps> = ({activeProduct, storyMapState, storyId, isOpen, onClose}) => {
	const [user] = useAuthState(auth)
	const [editMode, setEditMode] = useState(false)
	const story = getStories(storyMapState.data()).find((story) => story.id === storyId)!
	const [description, setDescription] = useState(story.description)

	useEffect(() => {
		setDescription(story.description)
	}, [story.description])

	const {control, handleSubmit, getFieldState, formState} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			branchName: story.branchName,
			designLink: story.designLink,
			name: story.name,
			pageLink: story.pageLink,
			points: story.points,
			sprintColumn: story.sprintColumn,
			versionId: story.versionId,
		},
	})

	const onSubmit = handleSubmit(async (data) => {
		const newData = produce(storyMapState.data(), (draft) => {
			draft.items[storyId] = {...(draft.items[storyId] as Story), ...data}
		})
		await setDoc(storyMapState.ref, newData)
		setEditMode(false)
	})

	const [versions] = useCollection(
		collection(db, `StoryMapStates`, storyMapState.id, `Versions`).withConverter(VersionConverter),
	)

	const addVote = async (vote: boolean) => {
		if (!user) return
		const ethicsVotes = story.ethicsVotes.filter((vote) => vote.userId !== user.uid)
		ethicsVotes.push({userId: user.uid as Id, vote})
		const votingComplete = ethicsVotes.length === Object.keys(activeProduct.data().members).length

		let ethicsColumn: `identified` | `underReview` | `adjudicated` = `identified`
		if (ethicsVotes.length === 1) ethicsColumn = `underReview`
		if (votingComplete) ethicsColumn = `adjudicated`

		const newData = produce(storyMapState.data(), (draft) => {
			draft.items[storyId] = {
				...(draft.items[storyId] as Story),
				ethicsApproved: votingComplete
					? ethicsVotes.filter((vote) => vote.vote === true).length >
					  ethicsVotes.filter((vote) => vote.vote === false).length
					: null,
				ethicsColumn,
				ethicsVotes,
			}
		})
		await setDoc(storyMapState.ref, newData)
	}

	return (
		<Drawer
			title={
				<div className="flex h-14 flex-col justify-center gap-1">
					{!editMode && <p>{story.name}</p>}
					<div>
						{editMode ? (
							<Button
								type="primary"
								danger
								onClick={() => {
									const data = produce(storyMapState.data(), (draft) => {
										delete draft.items[storyId]
									})
									setDoc(storyMapState.ref, data).catch(console.error)
								}}
							>
								Delete
							</Button>
						) : (
							<div className="relative">
								<div>
									<Tag color="#585858" icon={<NumberOutlined />}>
										{story.points} point{story.points === 1 ? `` : `s`}
									</Tag>
									<Tag
										color={typeof activeProduct.data().effortCost === `number` ? `#585858` : `#f5f5f5`}
										icon={<DollarOutlined />}
										className={clsx(
											typeof activeProduct.data().effortCost !== `number` && `border !border-current !text-[#d9d9d9]`,
										)}
									>
										{dollarFormat((activeProduct.data().effortCost ?? 0) * story.points)}
									</Tag>
									<Tag color="#585858" icon={<FlagOutlined />}>
										{sprintColumns[story.sprintColumn]}
									</Tag>
								</div>

								<div className="absolute left-96 top-0">
									<Tag
										color={story.branchName ? `#0958d9` : `#f5f5f5`}
										icon={<CodeOutlined />}
										style={story.branchName ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
									>
										{story.branchName ?? `No branch`}
									</Tag>
									<LinkTo href={story.designLink} openInNewTab>
										<Tag
											color={story.designLink ? `#0958d9` : `#f5f5f5`}
											icon={<BlockOutlined />}
											style={story.designLink ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
										>
											Design
										</Tag>
									</LinkTo>
									<LinkTo href={story.pageLink} openInNewTab>
										<Tag
											color={story.pageLink ? `#0958d9` : `#f5f5f5`}
											icon={<LinkOutlined />}
											style={story.pageLink ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
										>
											Page
										</Tag>
									</LinkTo>
								</div>
							</div>
						)}
					</div>
				</div>
			}
			placement="bottom"
			height={500}
			open={isOpen}
			onClose={() => onClose()}
		>
			{editMode ? (
				<Form
					id="story-form"
					layout="vertical"
					className="flex flex-col gap-4"
					onFinish={() => {
						onSubmit().catch(console.error)
					}}
				>
					<div className="flex gap-8">
						<Form.Item
							label="Title"
							hasFeedback
							validateStatus={formValidateStatus(getFieldState(`name`, formState))}
							className="grow"
						>
							<RhfInput control={control} name="name" />
						</Form.Item>
						<Form.Item
							label="Effort Estimate"
							hasFeedback
							validateStatus={formValidateStatus(getFieldState(`points`, formState))}
						>
							<RhfSegmented control={control} name="points" options={[1, 2, 3, 5, 8, 13]} />
						</Form.Item>
						<Form.Item label="Version">
							<RhfSelect
								control={control}
								name="versionId"
								options={versions?.docs.map((version) => ({label: version.data().name, value: version.id}))}
							/>
						</Form.Item>
						<Form.Item label="Status" className="shrink-0 basis-56">
							<RhfSelect
								control={control}
								name="sprintColumn"
								options={Object.entries(sprintColumns).map(([key, value]) => ({label: value, value: key}))}
							/>
						</Form.Item>
					</div>
					<Form.Item
						label="Design"
						hasFeedback
						validateStatus={formValidateStatus(getFieldState(`designLink`, formState))}
						help={formState.errors.designLink?.message}
					>
						<RhfInput control={control} name="designLink" placeholder="https://" />
					</Form.Item>
					<Form.Item
						label="Branch"
						hasFeedback
						validateStatus={formValidateStatus(getFieldState(`branchName`, formState))}
						help={formState.errors.branchName?.message}
					>
						<RhfInput control={control} name="branchName" />
					</Form.Item>
					<Form.Item
						label="Page"
						hasFeedback
						validateStatus={formValidateStatus(getFieldState(`pageLink`, formState))}
						help={formState.errors.pageLink?.message}
					>
						<RhfInput control={control} name="pageLink" placeholder="https://" />
					</Form.Item>
				</Form>
			) : (
				<div className="grid h-full grid-cols-2 gap-8">
					{/* Left column */}
					<div className="flex h-full min-h-0 flex-col gap-6">
						<div className="flex flex-col gap-2">
							{story.ethicsApproved === null ? (
								<>
									<div>
										<p className="text-xl font-semibold">Adjudication Response</p>
										<p className="text-xs">
											Do you think this would provide value and reaffirm the commitment to our users?
										</p>
									</div>

									<Radio.Group
										onChange={(e) => {
											addVote(e.target.value === `allow`).catch(console.error)
										}}
									>
										<Radio value="allow">Allow</Radio>
										<Radio value="reject">Reject</Radio>
									</Radio.Group>
								</>
							) : (
								<>
									<p className="text-xl font-semibold">Adjudication Response</p>
									{story.ethicsApproved ? (
										<div className="inline-flex items-center gap-2 bg-[#90d855] py-2 px-4">
											<LikeOutlined />
											Allowed
										</div>
									) : (
										<div className="inline-flex items-center gap-2 bg-[#ffa39e] py-2 px-4">
											<DislikeOutlined />
											Rejected
										</div>
									)}
								</>
							)}
						</div>
						<div className="flex max-h-[calc(100%-8rem)] flex-col gap-2">
							<p className="text-xl font-semibold text-gray">Story</p>
							<Input.TextArea
								rows={4}
								value={description}
								onChange={(e) => {
									setDescription(e.target.value)
									const newData = produce(storyMapState.data(), (draft) => {
										draft.items[storyId] = {...(draft.items[storyId] as Story), description: e.target.value}
									})
									setDoc(storyMapState.ref, newData).catch(console.error)
								}}
								className="max-h-[calc(100%-2.25rem)]"
							/>
						</div>
					</div>

					{/* Right column */}
					<div className="flex h-full flex-col gap-2">
						<p className="text-xl font-semibold text-gray">Comments</p>
						<div className="relative grow">
							<Comments
								storyMapStateId={storyMapState.id as Id}
								parentId={storyId}
								flagged={story.ethicsColumn !== null}
								onFlag={async () => {
									const newData = produce(storyMapState.data(), (draft) => {
										draft.items[storyId] = {...(draft.items[storyId] as Story), ethicsColumn: `identified`}
									})
									await setDoc(storyMapState.ref, newData)
								}}
							/>
						</div>
					</div>
				</div>
			)}
		</Drawer>
	)
}

export default StoryDrawer
