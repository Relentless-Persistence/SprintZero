import {
	BlockOutlined,
	BranchesOutlined,
	CloseOutlined,
	ClusterOutlined,
	CodeOutlined,
	CommentOutlined,
	DollarOutlined,
	FlagOutlined,
	LinkOutlined,
	NumberOutlined,
	PullRequestOutlined,
	RobotOutlined,
	RocketOutlined,
	SolutionOutlined,
	UserOutlined,
} from "@ant-design/icons"
import { zodResolver } from "@hookform/resolvers/zod"
import { Avatar, Button, Checkbox, Divider, Drawer, Dropdown, Form, Input, MenuProps, Popover, Segmented, Skeleton, Tabs, Tag } from "antd"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { collection } from "firebase/firestore"
import produce from "immer"
import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import { useForm } from "react-hook-form"
import { useInterval } from "react-use"

import type { QueryDocumentSnapshot, QuerySnapshot } from "firebase/firestore"
import type { FC } from "react"
import type { z } from "zod"
import type { Member } from "~/types/db/Products/Members"
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems"
import type { Version } from "~/types/db/Products/Versions"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import Comments from "~/components/Comments"
import LinkTo from "~/components/LinkTo"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfSelect from "~/components/rhf/RhfSelect"
import { MemberConverter } from "~/types/db/Products/Members"
import { StoryMapItemSchema, sprintColumns } from "~/types/db/Products/StoryMapItems"
import dollarFormat from "~/utils/dollarFormat"
import { formValidateStatus } from "~/utils/formValidateStatus"
import { debouncedUpdateItem, deleteItem, updateItem } from "~/utils/storyMap"
import { useTheme } from "~/utils/ThemeContext"
import { trpc } from "~/utils/trpc"

dayjs.extend(relativeTime)

const formSchema = StoryMapItemSchema.pick({
	branchName: true,
	designEffort: true,
	designLink: true,
	engineeringEffort: true,
	pageLink: true,
	sprintColumn: true,
	peopleIds: true,
	versionId: true,
})
type FormInputs = z.infer<typeof formSchema>

export type StoryDrawerProps = {
	storyMapItems: StoryMapItem[]
	versions: QuerySnapshot<Version>
	storyId: string
	isOpen: boolean,
	//isUsGenInProgress: boolean
	onClose: () => void
}

const StoryDrawer: FC<StoryDrawerProps> = ({ storyMapItems, versions, storyId, isOpen, onClose }) => {
	const { product } = useAppContext()
	const [editMode, setEditMode] = useState(false)
	const [newAcceptanceCriterionInput, setNewAcceptanceCriterionInput] = useState(``)
	const [newBugInput, setNewBugInput] = useState(``)
	const story = storyMapItems.find((story) => story.id === storyId)!
	const [commentType, setCommentType] = useState<`engineering` | `design`>(`design`)
	const [currentStoryTab, setCurrentStoryTab] = useState<(typeof storyTabs)[number][0]>(`accCriteria`)
	const [scrumGenieRunning, setScrumGenieRunning] = useState(false)
	const [engEffort, setEngEffort] = useState<number>(story.engineeringEffort);
	const [designEffort, setDesignEffort] = useState<number>(story.designEffort);
	const genStoryDesc = trpc.gpt4.useMutation()

	const sgGenUserStory = async () => {
		setScrumGenieRunning(true);
		setDescription('')
		const storyName = story.name
		const feature = storyMapItems.find((item) => item.id === story.parentId)
		const featureName = feature?.name
		const epicName = storyMapItems.find((item) => item.id === feature?.parentId)?.name

		const newStoryDescRaw = await genStoryDesc.mutateAsync({
			prompt: `We are a team building a product. Help us to write a complete user story described as a "user story template". The user story belongs to a feature called "${featureName ?? ""}". And the feature belongs to an epic called "${epicName ?? ""}". And the user story has a short name "${storyName ?? ""}". Your output should include only one sentence.`,
		})

		console.log(newStoryDescRaw)

		const newStoryDesc = newStoryDescRaw.response
			?.split(`\n`)
			.map((s) => s.replace(/^[0-9]+\. */, ``))
			.filter((s) => s !== ``)[0]

		//console.log(newStoryDesc)

		if (newStoryDesc) {
			await updateItem(product, storyMapItems, versions, story.id, { description: newStoryDesc }).catch(console.error)
			setScrumGenieRunning(false);
			setDescription(newStoryDesc)
		}
	}

	const handleEngEffortChange = async (value: number) => {
		setEngEffort(value);
		await updateItem(product, storyMapItems, versions, story.id, {
			engineeringEffort: value,
		})
	};

	const handleDesignEffortChange = async (value: number) => {
		setDesignEffort(value);
		await updateItem(product, storyMapItems, versions, story.id, {
			designEffort: value,
		})
	};


	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	useErrorHandler(membersError)

	const items: MenuProps[`items`] = versions.docs.map(v => ({ key: v.id, label: v.data().name }))
	// 	{ key: `identified`, label: `Identified` },
	// 	{ key: `contacted`, label: `Contacted` },
	// 	{ key: `scheduled`, label: `Scheduled` },
	// 	{ key: `interviewed`, label: `Interviewed` },
	// 	{ key: `analyzing`, label: `Analyzing` },
	// 	{ key: `processed`, label: `Processed` }
	// ]

	const [lastModifiedText, setLastModifiedText] = useState<string | undefined>(undefined)
	useInterval(() => {
		setLastModifiedText(dayjs(story.updatedAt.toMillis()).fromNow())
	}, 200)

	const [localStoryName, setLocalStoryName] = useState(story.name)
	useEffect(() => {
		setLocalStoryName(story.name)
	}, [story.name])

	const [description, setDescription] = useState(story.description)
	useEffect(() => {
		setDescription(story.description)
	}, [story.description])

	const { control, handleSubmit, getFieldState, formState, reset } = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			branchName: story.branchName,
			designLink: story.designLink,
			designEffort: story.designEffort,
			engineeringEffort: story.engineeringEffort,
			pageLink: story.pageLink,
			sprintColumn: story.sprintColumn,
			peopleIds: story.peopleIds,
			versionId: story.versionId,
		},
	})

	const onSubmit = handleSubmit(async (data) => {
		await updateItem(product, storyMapItems, versions, story.id, data)
		setEditMode(false)
	})

	const toggleAcceptanceCriterion = async (id: string, checked: boolean) => {
		await updateItem(product, storyMapItems, versions, story.id, {
			acceptanceCriteria: produce(story.acceptanceCriteria, (draft) => {
				const index = draft.findIndex((criterion) => criterion.id === id)
				draft[index]!.checked = checked
				if (checked === true) {
					draft[index]!.status = `done`
				} else {
					draft[index]!.status = `todo`
				}
			}),
		})
	}

	const addAcceptanceCriterion = async () => {
		if (!newAcceptanceCriterionInput) return
		await updateItem(product, storyMapItems, versions, story.id, {
			acceptanceCriteria: [
				...story.acceptanceCriteria,
				{ id: nanoid(), name: newAcceptanceCriterionInput, checked: false, status: `todo` },
			],
		})
	}

	const toggleBug = async (id: string, checked: boolean) => {
		await updateItem(product, storyMapItems, versions, story.id, {
			bugs: produce(story.bugs, (draft) => {
				const index = draft.findIndex((bug) => bug.id === id)
				draft[index]!.checked = checked
				if (checked === true) {
					draft[index]!.status = `done`
				} else {
					draft[index]!.status = `todo`
				}
			}),
		})
	}

	const addBug = async () => {
		if (!newBugInput) return
		await updateItem(product, storyMapItems, versions, story.id, {
			bugs: [...story.bugs, { id: nanoid(), name: newBugInput, checked: false, status: `todo` }],
		})
	}

	const totalEffort = story.designEffort + story.engineeringEffort

	const peoplePopoverItems = story.peopleIds
		.map((userId) => members?.docs.find((user) => user.id === userId))
		.filter((member): member is QueryDocumentSnapshot<Member> => member?.exists() ?? false)
		.map((member) => (
			<div key={member.id} className="flex items-center gap-2 rounded bg-[#f0f0f0] p-2">
				<Avatar src={member.data().avatar} shape="square" size="small" />
				{member.data().name}
			</div>
		))

	const theme = useTheme()

	return (
		<Drawer
			placement="bottom"
			closable={false}
			height={500}
			open={isOpen}
			onClose={() => onClose()}
			title={
				editMode ? (
					<div className="flex h-14 items-center">
						<Button
							type="primary"
							danger
							onClick={() => {
								deleteItem(product, storyMapItems, versions, story.id).catch(console.error)
							}}
						>
							Delete
						</Button>
					</div>
				) : (
					<div className="flex h-14 flex-col justify-center gap-2">
						<div className="flex items-center gap-4">
							<div className="relative w-fit min-w-[1rem]">
								<p className="text-2xl font-normal">{localStoryName || `_`}</p>
								<input
									value={localStoryName}
									className="absolute inset-0 bg-transparent text-2xl font-normal"
									onChange={(e) => {
										setLocalStoryName(e.target.value)
										updateItem(product, storyMapItems, versions, story.id, { name: e.target.value }).catch(console.error)
									}}
								/>
							</div>
							{lastModifiedText && members && (
								<p className="text-sm font-normal text-textTertiary">
									Last modified {lastModifiedText} by{` `}
									{members.docs.find((user) => user.id === story.updatedAtUserId)?.data().name ?? `unknown user`}
								</p>
							)}
						</div>
						<div>
							<div className="relative flex gap-1 items-center">


								<Popover placement="bottomLeft" content={
									<div className="flex flex-col gap-2">
										<label className="flex flex-col gap-2">
											<span className="font-semibold">Design Effort (points)</span>
											<Segmented name="designEffort" value={designEffort} options={[1, 2, 3, 5, 8, 13]} onChange={handleDesignEffortChange} />
										</label>
										<label className="flex flex-col gap-2">
											<span className="font-semibold">Engineering Effort (points)</span>
											<Segmented name="engineeringEffort" value={engEffort} options={[1, 2, 3, 5, 8, 13]} onChange={handleEngEffortChange} />
										</label>
									</div>
								} trigger="click">
									<Tag color="#DDE3D5" icon={<NumberOutlined />} style={{ color: "#103001", border: "1px solid #A7C983" }}>
										{totalEffort} Point{totalEffort === 1 ? `` : `s`}
									</Tag>
								</Popover>


								<Tag
									color={
										typeof product.data().effortCost === `number`
											? `#DDE3D5`
											: theme === `light`
												? `#DDE3D5`
												: `#333333`
									}
									icon={<DollarOutlined />}
									style={{ color: "#103001", border: "1px solid #A7C983" }}
								// className={clsx(
								// 	typeof product.data().effortCost !== `number` &&
								// 	`!border-current !text-[#d9d9d9] dark:!text-[#555555]`,
								// )}
								>
									{Math.floor((product.data().effortCost ?? 0) * totalEffort)} USD
								</Tag>


								<Dropdown menu={{
									items
								}} placement="bottomRight" arrow>

									<Tag color="#DDE3D5" icon={<RocketOutlined />} style={{ color: "#103001", border: "1px solid #A7C983" }}>
										{versions.docs.find(v => v.id === story.versionId)?.data().name}
									</Tag>
								</Dropdown>

								<Tag color="#DDE3D5" icon={<FlagOutlined />} style={{ color: "#103001", border: "1px solid #A7C983" }}>
									{sprintColumns[story.sprintColumn]}
								</Tag>
								<Popover
									placement="bottom"
									content={
										<RhfSelect
											control={control}
											name="peopleIds"
											mode="multiple"
											options={members?.docs
												.filter((member): member is QueryDocumentSnapshot<Member> => member.exists())
												.map((member) => ({ label: member.data().name, value: member.id }))}

											style={{ width: "430px" }}
										/>
										// <div className="-m-1 flex flex-col gap-2">
										// 	{peoplePopoverItems.length > 0 ? (
										// 		peoplePopoverItems
										// 	) : (
										// 		<p className="italic text-textTertiary">No people assigned to this story.</p>
										// 	)}
										// </div>
									}
								>
									<Tag color="#DDE3D5" icon={<UserOutlined />} className="text-sm" style={{ color: "#103001", border: "1px solid #A7C983" }}>
										{story.peopleIds.length}
									</Tag>
								</Popover>

								<Divider type="vertical" style={{ height: "15px" }} />

								<Tag color="#DDE3D5" icon={<BranchesOutlined />} className="text-sm" style={{ color: "#103001", border: "1px solid #A7C983" }}>
									Commit
								</Tag>
								<Tag color="#DDE3D5" icon={<BlockOutlined />} className="text-sm" style={{ color: "#103001", border: "1px solid #A7C983" }}>
									Design
								</Tag>
								<Tag color="#DDE3D5" icon={<SolutionOutlined />} className="text-sm" style={{ color: "#103001", border: "1px solid #A7C983" }}>
									Insight
								</Tag>
								<Tag color="#DDE3D5" icon={<LinkOutlined />} className="text-sm" style={{ color: "#103001", border: "1px solid #A7C983" }}>
									Page
								</Tag>
								<Tag color="#DDE3D5" icon={<ClusterOutlined />} className="text-sm" style={{ color: "#103001", border: "1px solid #A7C983" }}>
									System
								</Tag>

								{/* <div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-1">
									<Tag
										color={story.branchName ? `#0958d9` : theme === `light` ? `#f5f5f5` : `#333333`}
										icon={<CodeOutlined />}
										className={clsx(!story.branchName && `!border-current !text-[#d9d9d9] dark:!text-[#555555]`)}
									>
										{story.branchName ?? `No branch`}
									</Tag>
									<LinkTo href={story.designLink} openInNewTab>
										<Tag
											color={story.designLink ? `#0958d9` : theme === `light` ? `#f5f5f5` : `#333333`}
											icon={<BlockOutlined />}
											className={clsx(!story.designLink && `!border-current !text-[#d9d9d9] dark:!text-[#555555]`)}
										>
											Design
										</Tag>
									</LinkTo>
									<LinkTo href={story.pageLink} openInNewTab>
										<Tag
											color={story.pageLink ? `#0958d9` : theme === `light` ? `#f5f5f5` : `#333333`}
											icon={<LinkOutlined />}
											style={story.pageLink ? {} : { color: `#d9d9d9`, border: `1px solid currentColor` }}
											className={clsx(!story.pageLink && `!border-current !text-[#d9d9d9] dark:!text-[#555555]`)}
										>
											Page
										</Tag>
									</LinkTo>
								</div> */}
							</div>
						</div>
					</div>
				)
			}
			extra={
				<div className="flex items-center gap-4">
					{editMode ? (
						<>
							<Button
								onClick={() => {
									setEditMode(false)
									reset({
										branchName: story.branchName,
										designLink: story.designLink,
										designEffort: story.designEffort,
										engineeringEffort: story.engineeringEffort,
										pageLink: story.pageLink,
										sprintColumn: story.sprintColumn,
										peopleIds: story.peopleIds,
										versionId: story.versionId,
									})
								}}
							>
								Cancel
							</Button>
							<Button type="primary" htmlType="submit" form="story-form">
								Done
							</Button>
						</>
					) : (
						<>
							<Button onClick={() => setEditMode(true)}>Edit</Button>
							<button type="button" onClick={() => onClose()}>
								<CloseOutlined />
							</button>
						</>
					)}
				</div>
			}
		>
			{editMode ? (
				<form
					id="story-form"
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						onSubmit(e).catch(console.error)
					}}
				>
					<div className="flex gap-8">
						<label className="flex grow flex-col gap-2">
							<span className="font-semibold">Team members</span>
							<RhfSelect
								control={control}
								name="peopleIds"
								mode="multiple"
								options={members?.docs
									.filter((member): member is QueryDocumentSnapshot<Member> => member.exists())
									.map((member) => ({ label: member.data().name, value: member.id }))}
							/>
						</label>
						<label className="flex flex-col gap-2">
							<span className="font-semibold">Design Effort</span>
							<RhfSegmented control={control} name="designEffort" options={[1, 2, 3, 5, 8, 13]} />
						</label>
						<label className="flex flex-col gap-2">
							<span className="font-semibold">Engineering Effort</span>
							<RhfSegmented control={control} name="engineeringEffort" options={[1, 2, 3, 5, 8, 13]} />
						</label>
						<label className="flex shrink-0 basis-20 flex-col gap-2">
							<span className="font-semibold">Version</span>
							<RhfSelect
								control={control}
								name="versionId"
								options={versions.docs.map((version) => ({ label: version.data().name, value: version.id }))}
							/>
						</label>
						<label className="flex shrink-0 basis-56 flex-col gap-2">
							<span className="font-semibold">Status</span>
							<RhfSelect
								control={control}
								name="sprintColumn"
								options={Object.entries(sprintColumns).map(([key, value]) => ({ label: value, value: key }))}
							/>
						</label>
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
				</form>
			) : (
				<div className="grid h-full grid-cols-2 gap-14">
					{/* Left column */}
					<div className="flex h-full min-h-0 flex-col gap-1">
						<div className="flex flex-col gap-2">
							<div className="flex justify-between gap-3">
								<div className="flex gap-2 items-center">
									<p className="text-xl font-semibold" style={{ color: "#595959" }}>User Story</p>
									<div className="flex gap-2">
										<Button disabled={scrumGenieRunning} onClick={sgGenUserStory}
											className="flex items-center justify-center" icon={<RobotOutlined />}></Button>
									</div>
								</div>

								<Button
									icon={<FlagOutlined color="#820014" />}
									style={{ color: '#820014', borderColor: '#820014' }}
									disabled={story.ethicsColumn !== null}
									onClick={() => {
										if (story.ethicsColumn == null) {
											updateItem(product, storyMapItems, versions, story.id, { ethicsColumn: `underReview` }).catch(
												console.error,
											)
										}
									}
									}
									className="flex items-center"
								>
									{story.ethicsColumn !== null ? `Flagged` : `Flag`}
								</Button>
							</div>
							<div style={{ position: 'relative', justifyContent: 'center' }}>
								<Input.TextArea
									rows={5}
									value={description}
									onChange={(e) => {
										setDescription(e.target.value)
										debouncedUpdateItem(product, storyMapItems, versions, story.id, { description: e.target.value })?.catch(
											console.error,
										)
									}}
									className=""
								/>
								{(scrumGenieRunning) && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, width: '97%' }}>
									<Skeleton active loading={true} style={{ height: "50px" }} title={false} paragraph={{ rows: 3 }} />
								</div>}
							</div>
						</div>

						<Tabs
							tabPosition="top"
							activeKey={currentStoryTab}
							onChange={(tab: (typeof storyTabs)[number][0]) => setCurrentStoryTab(tab)}
							items={storyTabs.map(([key, label]) => ({
								key, label:
									(
										<span>
											<Tag>{(key === "bugs") ? story.bugs.length : key === "accCriteria" ? story.acceptanceCriteria.length : 0}</Tag>
											<span className="ml-2">{label}</span>
										</span>
									), disabled: key === "changeLog" ? true : false
							}))}
						/>

						{
							currentStoryTab === "bugs" && <div className="flex min-h-0 flex-col gap-2">
								<div className="flex flex-col gap-2 p-0.5" style={{ flexWrap: "wrap", overflowX: "auto" }}>
									{story.bugs.map((bug) => (
										<Checkbox
											key={bug.id}
											checked={bug.checked}
											onChange={(e) => {
												toggleBug(bug.id, e.target.checked).catch(console.error)
											}}
											className="w-full [&_span:last-child]:grow [&_span:last-child]:basis-0 [&_span:last-child]:truncate"
										>
											{bug.name}
										</Checkbox>
									))}
									<Input
										size="small"
										placeholder="Add item"
										value={newBugInput}
										onChange={(e) => setNewBugInput(e.target.value)}
										onPressEnter={() => {
											addBug()
												.then(() => {
													setNewBugInput(``)
												})
												.catch(console.error)
										}}
										className="w-48"
									/>
								</div>
							</div>
						}

						{
							currentStoryTab === "accCriteria" &&


							<div className="flex min-h-0 flex-col gap-2">
								<div className="flex flex-col gap-2 p-0.5" style={{ flexWrap: "wrap", overflowX: "auto" }}>
									{story.acceptanceCriteria.map((criterion) => (
										<Checkbox
											key={criterion.id}
											checked={criterion.checked}
											onChange={(e) => {
												toggleAcceptanceCriterion(criterion.id, e.target.checked).catch(console.error)
											}}
											style={{ marginLeft: `0px` }}
										>
											{criterion.name}
										</Checkbox>
									))}
									<Input
										size="small"
										placeholder="Add item"
										value={newAcceptanceCriterionInput}
										onChange={(e) => setNewAcceptanceCriterionInput(e.target.value)}
										onPressEnter={() => {
											addAcceptanceCriterion()
												.then(() => {
													setNewAcceptanceCriterionInput(``)
												})
												.catch(console.error)
										}}
										className="w-52"
									/>
								</div>
							</div>
						}
					</div>

					{/* Right column */}
					<div className="flex h-full flex-col gap-2">
						<div className="flex items-center justify-between">
							<p className="text-xl font-semibold" style={{ color: "#595959" }}>Comments</p>
							<Segmented
								size="small"
								value={commentType}
								onChange={(value) => setCommentType(value as `engineering` | `design`)}
								options={[
									{ label: `Design`, icon: <BlockOutlined />, value: `design` },
									{ label: `Engineering`, icon: <PullRequestOutlined />, value: `engineering` },
								]}
							/>
						</div>
						<div className="relative grow">
							<Comments
								storyMapItem={story}
								flagged={story.ethicsColumn !== null}
								commentType={commentType}
								onFlag={() => {
									updateItem(product, storyMapItems, versions, story.id, { ethicsColumn: `underReview` }).catch(
										console.error,
									)
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

const storyTabs = [
	[`accCriteria`, `Acceptance Criteria`],
	[`bugs`, `Bugs`],
	[`changeLog`, `Change Log`],
] as const