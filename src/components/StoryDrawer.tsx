import {
	ArrowRightOutlined,
	BlockOutlined,
	BranchesOutlined,
	CloseOutlined,
	ClusterOutlined,
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
import { Avatar, Button, Checkbox, Divider, Drawer, Form, Input, Menu, Popover, Segmented, Select, Skeleton, Tabs, Tag } from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { addDoc, collection, updateDoc } from "firebase/firestore"
import produce from "immer"
import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import { useForm } from "react-hook-form"
import { useInterval } from "react-use"
import { z } from 'zod';

import type { SelectProps } from "antd";
import type { QueryDocumentSnapshot, QuerySnapshot, WithFieldValue } from "firebase/firestore"
import type { FC } from "react"
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
import { TaskConverter } from "~/types/db/Products/Tasks"
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
	const genStoryDesc = trpc.gpt.useMutation()

	const [storyVersionKey, setStoryVersionKey] = useState<string>(versions.docs.find((v) => v.id === story.versionId)!.id);
	const [storyVersionLabel, setStoryVersionLabel] = useState<string>(versions.docs.find((v) => v.id === story.versionId)!.data().name);
	const [storyLifecycleKey, setStoryLifecycleKey] = useState<string>(Object.entries(sprintColumns).find(([key]) => key === story.sprintColumn)![0])
	const [storyLifecycleLabel, setStoryLifecycleLabel] = useState<string>(Object.entries(sprintColumns).find(([key]) => key === story.sprintColumn)![1])
	const [storyLifecyclePopoverIsOpen, setStoryLifecyclePopoverIsOpen] = useState(false)
	const [storyVersionPopoverIsOpen, setStoryVersionPopoverIsOpen] = useState(false)
	const [storyAssignment, setStoryAssignment] = useState<string[] | undefined>(story.peopleIds)
	const [storyDesignLink, setStoryDesignLink] = useState(story.designLink)
	const [isDesignLinkValidUrl, setIsDesignLinkValidUrl] = useState(true)

	type sprintColumnKey = keyof typeof sprintColumns

	const handleStoryLifecycleChange = async ({ key }: { key: string }) => {
		const label = Object.entries(sprintColumns).find(([keyL, valueL]) => keyL === key)![1];
		setStoryLifecycleKey(key);
		setStoryLifecycleLabel(label);
		await updateItem(product, storyMapItems, versions, story.id, {
			sprintColumn: key as WithFieldValue<sprintColumnKey>,
		})
	};

	const handleStoryVersionChange = async ({ key }: { key: string }) => {
		const label = versions.docs.find((v) => v.id === key)!.data().name;
		setStoryVersionKey(key);
		setStoryVersionLabel(label);
		await updateItem(product, storyMapItems, versions, story.id, {
			versionId: key,
		})
	};

	const handleStoryAssignmentChange = async (value: string[]) => {
		setStoryAssignment(value);
		await updateItem(product, storyMapItems, versions, story.id, {
			peopleIds: value as WithFieldValue<string[] | undefined>,
		})
	};

	const sgGenUserStory = async () => {
		setScrumGenieRunning(true);
		setDescription(``)
		const storyName = story.name
		const feature = storyMapItems.find((item) => item.id === story.parentId)
		const featureName = feature?.name
		const epicName = storyMapItems.find((item) => item.id === feature?.parentId)?.name

		const newStoryDescRaw = await genStoryDesc.mutateAsync({
			prompt: `You are a business analyst. We are a team building a product. Help us to write a complete user story described as a "user story template". The user story belongs to a feature called "${featureName ?? ``}". And the feature belongs to an epic called "${epicName ?? ``}". And the user story has a short name "${storyName ?? ``}". Your output should include only one sentence.`,
		})

		const newStoryDesc = newStoryDescRaw.response
			?.split(`\n`)
			.map((s) => s.replace(/^[0-9]+\. */, ``))
			.filter((s) => s !== ``)[0]

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

	const [tasks, , tasksError] = useCollection(collection(product.ref, `Tasks`).withConverter(TaskConverter))
	useErrorHandler(tasksError)

	const storyAssignmentOptions: SelectProps['options'] = members?.docs
		.filter((member): member is QueryDocumentSnapshot<Member> => member.exists())
		.map((member) => ({ label: member.data().name, value: member.id }))

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
		const task = tasks?.docs.find(t => t.id === story.acceptanceCriteria.find(cr => cr.id === id)?.taskId)
		await updateDoc(task!.ref, {
			status: checked ? `done` : `todo`
		})
	}

	const addAcceptanceCriterion = async () => {
		if (!newAcceptanceCriterionInput) return

		const newAcTask = await addDoc(collection(product.ref, `Tasks`).withConverter(TaskConverter), {
			title: newAcceptanceCriterionInput,
			type: `acceptanceCriteria`,
			status: `todo`,
			storyId: story.id
		})

		await updateItem(product, storyMapItems, versions, story.id, {
			acceptanceCriteria: [
				...story.acceptanceCriteria,
				{ id: nanoid(), name: newAcceptanceCriterionInput, taskId: newAcTask.id },
			],
		})
	}

	const toggleBug = async (id: string, checked: boolean) => {
		const task = tasks?.docs.find(t => t.id === story.bugs.find(bug => bug.id === id)?.taskId)
		await updateDoc(task!.ref, {
			status: checked ? `done` : `todo`
		})
	}

	const addBug = async () => {
		if (!newBugInput) return

		const newBugTask = await addDoc(collection(product.ref, `Tasks`).withConverter(TaskConverter), {
			title: newBugInput,
			type: `bug`,
			status: `todo`,
			storyId: story.id,
		})

		await updateItem(product, storyMapItems, versions, story.id, {
			bugs: [...story.bugs, { id: nanoid(), name: newBugInput, taskId: newBugTask.id }],
		})
	}

	const totalEffort = story.designEffort + story.engineeringEffort

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
					<div className="flex h-14 flex-col justify-center gap-2 storyDrawerTags">
						<div className="flex items-center gap-4">
							<div className="relative w-fit min-w-[1rem]">
								<p className="text-2xl font-normal">{localStoryName || `_`}</p>
								<input
									value={localStoryName}
									className="absolute inset-0 bg-transparent text-2xl font-normal"
									onChange={(e) => {
										setLocalStoryName(e.target.value)

										if (e.target.value === ``)
											return

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
									<Button type="primary" size="small" icon={<NumberOutlined />} style={{ background: `#DDE3D5`, color: `#000000`, border: `1px solid #A7C983` }}>
										{totalEffort} Point{totalEffort === 1 ? `` : `s`}
									</Button>
								</Popover>


								<Button type="primary" size="small" icon={<DollarOutlined />} style={{ background: `#DDE3D5`, color: `#000000`, border: `1px solid #A7C983` }}>
									{Math.floor((product.data().effortCost ?? 0) * totalEffort)} USD
								</Button>

								<Popover style={{ height: `200px`, overflow: `auto` }} placement="bottomRight"
									open={storyVersionPopoverIsOpen}
									onOpenChange={visible => setStoryVersionPopoverIsOpen(visible)}

									content={
										<Menu
											mode="vertical"
											selectedKeys={[storyVersionKey]}
											onClick={handleStoryVersionChange}
											style={{ border: `none`, maxHeight: `250px`, overflow: `auto` }}
										>
											{/* versions.docs.map(v => ({ key: v.id, label: v.data().name })) */}
											{versions.docs.sort((a, b) => {
												const versionA = a.data().name.split(`.`).map(Number);
												const versionB = b.data().name.split(`.`).map(Number);

												for (let i = 0; i < 3; i++) {
													if (versionA[i] !== versionB[i]) {
														return versionB[i]! - versionA[i]!;
													}
												}

												return 0;
											}).reverse().map((version) => (
												<Menu.Item key={version.id} style={{ height: `30px`, lineHeight: `30px` }} onClick={() => setStoryVersionPopoverIsOpen(false)}>{version.data().name}</Menu.Item>
											))}
										</Menu>
									} trigger="click">
									<Button onClick={() => setStoryVersionPopoverIsOpen(!storyVersionPopoverIsOpen)} type="primary" size="small" icon={<RocketOutlined />} style={{ background: `#DDE3D5`, color: `#000000`, border: `1px solid #A7C983` }}>
										{storyVersionLabel}
									</Button>
								</Popover>

								<Popover style={{ height: `200px`, overflow: `auto` }} placement="topRight"
									open={storyLifecyclePopoverIsOpen}
									onOpenChange={visible => setStoryLifecyclePopoverIsOpen(visible)}
									content={
										<Menu
											mode="vertical"
											selectedKeys={[storyLifecycleKey]}
											onClick={handleStoryLifecycleChange}
											style={{ border: `none`, maxHeight: `300px`, overflow: `auto` }}
										>
											{Object.entries(sprintColumns).map(([key, column]) => (
												<Menu.Item key={key} style={{ height: `30px`, lineHeight: `30px` }} onClick={() => setStoryLifecyclePopoverIsOpen(false)}>{column}</Menu.Item>
											))}
										</Menu>
									} trigger="click">
									<Button onClick={() => setStoryLifecyclePopoverIsOpen(!storyLifecyclePopoverIsOpen)} type="primary" size="small" icon={<FlagOutlined />} style={{ background: `#DDE3D5`, color: `#000000`, border: `1px solid #A7C983` }}>
										{storyLifecycleLabel}
									</Button>
								</Popover>

								<Popover
									placement="bottom"
									trigger="click"
									content={
										<Select
											showSearch
											optionFilterProp="children"
											onChange={handleStoryAssignmentChange}
											//name="peopleIds"
											mode="multiple"
											options={storyAssignmentOptions}
											allowClear
											style={{ width: `430px` }}
											value={storyAssignment}
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
									<Button type="primary" size="small" icon={<UserOutlined />} style={{ background: `#DDE3D5`, color: `#000000`, border: `1px solid #A7C983` }}>
										<span>{story.peopleIds.length}</span>
									</Button>
								</Popover>

								<Divider type="vertical" style={{ height: `15px` }} />

								<Button disabled type="primary" size="small" icon={<BranchesOutlined />}
								//style={{ background: `#DDE3D5`, color: `#000000`, border: `1px solid #A7C983` }}
								>
									Commit
								</Button>
								<Popover
									placement="bottom"
									trigger="click"
									content={
										<Input
											status={!isDesignLinkValidUrl ? `error` : ``}
											onChange={(e) => {
												//console.log(e.target.value)
												setStoryDesignLink(e.target.value);

												const schema = z.string().url();
												try {
													schema.parse(e.target.value);
													// URL is valid
													//console.log(`Valid URL:`, e.target.value);
													setIsDesignLinkValidUrl(true)
													updateItem(product, storyMapItems, versions, story.id, {
														//designLink: value as WithFieldValue<string | undefined>,
														designLink: e.target.value
													})
													// Perform other actions here
												} catch (error) {
													// URL is not valid
													//console.error(`Invalid URL:`, e.target.value);
													setIsDesignLinkValidUrl(false)
													// Handle the validation error
												}



											}}
											style={{ width: `430px` }}
											value={storyDesignLink ?? ``}
											suffix={
												<LinkTo openInNewTab href={storyDesignLink}>
													<div
														className="flex items-center justify-center gap-1">
														<span className="font-semibold" style={{ color: `#0958D9` }}>View</span>
														<ArrowRightOutlined style={{ color: `#0958D9` }} />
													</div>
												</LinkTo>
											}
										/>
									}
								>
									<Button type="primary" size="small" icon={<BlockOutlined />} style={{ background: `#DDE3D5`, color: `#000000`, border: `1px solid #A7C983` }}>
										Design
									</Button>
								</Popover>
								<Button disabled type="primary" size="small" icon={<SolutionOutlined />}>
									Insight
								</Button>
								<Button disabled type="primary" size="small" icon={<LinkOutlined />}>
									Page
								</Button>
								<Button disabled type="primary" size="small" icon={<ClusterOutlined />}>
									System
								</Button>
							</div>
						</div>
					</div >
				)
			}
			extra={
				< div className="flex items-center gap-4" >
					{
						editMode ? (
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
								{/* <Button onClick={() => setEditMode(true)}>Edit</Button> */}
								<button type="button" onClick={() => onClose()}>
									<CloseOutlined />
								</button>
							</>
						)}
				</div >
			}
		>
			{
				editMode ? (
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
					</form >
				) : (
					<div className="grid h-full grid-cols-2 gap-14">
						{/* Left column */}
						<div className="flex h-full min-h-0 flex-col gap-1">
							<div className="flex flex-col gap-2">
								<div className="flex justify-between gap-3">
									<div className="flex gap-2 items-center">
										<p className="text-xl font-semibold" style={{ color: `#595959` }}>User Story</p>
										<div className="flex gap-2">
											<Button disabled={scrumGenieRunning} onClick={sgGenUserStory}
												className="flex items-center justify-center" icon={<RobotOutlined />}></Button>
										</div>
									</div>

									{/* Should not show for Basic tier, to be implemented */}
									{/* <Button
									icon={<FlagOutlined color="#820014" />}
									style={{ color: `#820014`, borderColor: `#820014` }}
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
								</Button> */}
								</div>
								<div style={{ position: `relative`, justifyContent: `center` }}>
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
									{(scrumGenieRunning) && <div style={{ position: `absolute`, top: `50%`, left: `50%`, transform: `translate(-50%, -50%)`, zIndex: 9999, width: `97%` }}>
										<Skeleton active loading style={{ height: `50px` }} title={false} paragraph={{ rows: 3 }} />
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
												<Tag>{(key === `bugs`) ? story.bugs.length : key === `accCriteria` ? story.acceptanceCriteria.length : 0}</Tag>
												<span className="ml-2">{label}</span>
											</span>
										), disabled: key === `changeLog` ? true : false
								}))}
							/>

							{
								currentStoryTab === `bugs` && <div className="flex min-h-0 flex-col gap-2">
									<div className="flex flex-col gap-2 p-0.5" style={{ flexWrap: `wrap`, overflowX: `auto` }}>
										{story.bugs.map((bug) => (
											<Checkbox
												key={bug.id}
												checked={tasks?.docs.find(t => t.id === story.bugs.find(cr => cr.id === bug.id)?.taskId)?.data().status === `done` ? true : false}
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
								currentStoryTab === `accCriteria` &&


								<div className="flex min-h-0 flex-col gap-2">
									<div className="flex flex-col gap-2 p-0.5" style={{ flexWrap: `wrap`, overflowX: `auto` }}>
										{story.acceptanceCriteria.map((criterion) => (
											<Checkbox
												key={criterion.id}
												checked={tasks?.docs.find(t => t.id === story.acceptanceCriteria.find(cr => cr.id === criterion.id)?.taskId)?.data().status === `done` ? true : false}
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
								<p className="text-xl font-semibold" style={{ color: `#595959` }}>Comments</p>
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
		</Drawer >
	)
}

export default StoryDrawer

const storyTabs = [
	[`accCriteria`, `Acceptance Criteria`],
	[`bugs`, `Bugs`],
	[`changeLog`, `Change Log`],
] as const