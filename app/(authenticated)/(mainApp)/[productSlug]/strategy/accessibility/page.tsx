"use client"

import {GlobalOutlined} from "@ant-design/icons"
import {Button, Empty, Breadcrumb, Card, Input, Tabs} from "antd"
import {collection, doc, query, where} from "firebase/firestore"
import {useState, useEffect} from "react"
import {useCollectionData, useDocumentData} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {Id} from "~/types"

import LinkTo from "~/components/LinkTo"
import {AccessibilityItemConverter, AccessibilityItems} from "~/types/db/AccessibilityItems"
import {ProductConverter, Products} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {addAccessibilityItem, deleteAccessibilityItem, updateAccessibilityItem, updateProduct} from "~/utils/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const descriptions = {
	auditory: `Auditory disabilities range from mild or moderate hearing loss in one or both ears (“hard of hearing”) to substantial and uncorrectable hearing loss in both ears (“deafness”). Some people with auditory disabilities can hear sounds but sometimes not sufficiently to understand all speech, especially when there is background noise. This can include people using hearing aids.`,
	cognitive: `Cognitive, learning, and neurological disabilities involve neurodiversity and neurological disorders, as well as behavioral and mental health disorders that are not necessarily neurological. They may affect any part of the nervous system and impact how well people hear, move, see, speak, and understand information. Cognitive, learning, and neurological disabilities do not necessarily affect the intelligence of a person.`,
	physical: `Physical disabilities (sometimes called “motor disabilities”) include weakness and limitations of muscular control (such as involuntary movements including tremors, lack of coordination, or paralysis), limitations of sensation, joint disorders (such as arthritis), pain that impedes movement, and missing limbs.`,
	speech: `Speech disabilities include difficulty producing speech that is recognizable by others or by voice recognition software. For example, the loudness or clarity of someone’s voice might be difficult to understand.`,
	visual: `Visual disabilities range from mild or moderate vision loss in one or both eyes (“low vision”) to substantial and uncorrectable vision loss in both eyes (“blindness”). Some people have reduced or lack of sensitivity to certain colors (“color blindness”), or increased sensitivity to bright colors. These variations in perception of colors and brightness can be independent of the visual acuity.`,
}

const Accessibility = () => {
	const activeProductId = useActiveProductId()
	const [currentTab, setCurrentTab] = useState<`auditory` | `cognitive` | `physical` | `speech` | `visual`>(`auditory`)
	const [activeItemId, setActiveItemId] = useState<Id | undefined>(undefined)
	const [itemDraft, setItemDraft] = useState<{name: string; text: string} | undefined>(undefined)
	const [missionStatement, setMissionStatement] = useState(``)

	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))

	useEffect(() => {
		setMissionStatement(activeProduct?.accessibilityMissionStatements[currentTab] ?? ``)
	}, [activeProduct?.accessibilityMissionStatements, currentTab])

	const [accessibilityItems] = useCollectionData(
		query(
			collection(db, AccessibilityItems._),
			where(AccessibilityItems.productId, `==`, activeProductId),
		).withConverter(AccessibilityItemConverter),
	)

	const currentItems = accessibilityItems?.filter((item) => item.type === currentTab)

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex h-full flex-col gap-6 px-12 py-8">
				<div className="flex items-center justify-between">
					<Breadcrumb>
						<Breadcrumb.Item>Strategy</Breadcrumb.Item>
						<Breadcrumb.Item>Accessibility</Breadcrumb.Item>
						<Breadcrumb.Item className="capitalize">{currentTab}</Breadcrumb.Item>
					</Breadcrumb>

					<Button className="bg-white" onClick={() => void setItemDraft({name: ``, text: ``})}>
						Add New
					</Button>
				</div>

				<p className="text-[#595959]">
					{descriptions[currentTab]}
					{` `}To learn more visit{` `}
					<span className="font-semibold text-[#2d73c8]">
						<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
							WCAG 2.1 at a Glance
						</LinkTo>
					</span>
				</p>

				<Input
					addonBefore={<GlobalOutlined />}
					placeholder="Mission statement"
					value={missionStatement}
					onChange={(e) => {
						setMissionStatement(e.target.value)
						updateProduct({
							id: activeProductId!,
							data: {
								accessibilityMissionStatements: {
									...activeProduct!.accessibilityMissionStatements,
									[currentTab]: e.target.value,
								},
							},
						})
					}}
				/>

				{accessibilityItems && accessibilityItems.length > 0 && (
					<Masonry
						breakpointCols={3}
						className="grid grid-cols-3 gap-8"
						columnClassName="bg-clip-padding space-y-8 !w-full"
					>
						{currentItems?.map((item) => (
							<Card
								key={item.id}
								type="inner"
								title={
									item.id === activeItemId && itemDraft ? (
										<Input
											size="small"
											value={itemDraft.name}
											onChange={(e) => void setItemDraft((item) => ({name: e.target.value, text: item!.text}))}
											className="mr-4"
										/>
									) : (
										<p>{item.name}</p>
									)
								}
								extra={
									item.id === activeItemId && itemDraft ? (
										<div className="ml-4 flex gap-2">
											<Button
												size="small"
												onClick={() => {
													setActiveItemId(undefined)
													setItemDraft(undefined)
												}}
											>
												Cancel
											</Button>
											<Button
												size="small"
												type="primary"
												className="bg-green-s500"
												onClick={() => {
													updateAccessibilityItem({
														id: item.id,
														data: {
															name: itemDraft.name,
															text: itemDraft.text,
														},
													})
													setActiveItemId(undefined)
													setItemDraft(undefined)
												}}
											>
												Done
											</Button>
										</div>
									) : (
										<button
											type="button"
											onClick={() => {
												setItemDraft({name: item.name, text: item.text})
												setActiveItemId(item.id)
											}}
										>
											Edit
										</button>
									)
								}
							>
								{item.id === activeItemId && itemDraft ? (
									<div className="flex flex-col items-stretch gap-2">
										<div className="relative h-max">
											<p className="invisible min-w-0 border p-1">{itemDraft.text || `filler`}</p>
											<Input.TextArea
												value={itemDraft.text}
												onChange={(e) => void setItemDraft((item) => ({name: item!.name, text: e.target.value}))}
												className="absolute inset-0"
											/>
										</div>
										<Button danger onClick={() => void deleteAccessibilityItem({id: item.id})}>
											Remove
										</Button>
									</div>
								) : (
									<p className="min-w-0">{item.text}</p>
								)}
							</Card>
						))}

						{itemDraft && !activeItemId && (
							<Card
								type="inner"
								title={
									<Input
										size="small"
										value={itemDraft.name}
										onChange={(e) => void setItemDraft((item) => ({name: e.target.value, text: item!.text}))}
									/>
								}
								extra={
									<div className="ml-4 flex gap-2">
										<Button
											size="small"
											onClick={() => {
												setActiveItemId(undefined)
												setItemDraft(undefined)
											}}
										>
											Cancel
										</Button>
										<Button
											size="small"
											type="primary"
											className="bg-green-s500"
											onClick={() => {
												addAccessibilityItem({
													item: {
														name: itemDraft.name,
														text: itemDraft.text,
														type: currentTab,
														productId: activeProductId!,
													},
												})
												setActiveItemId(undefined)
												setItemDraft(undefined)
											}}
										>
											Done
										</Button>
									</div>
								}
							>
								<div className="relative h-max">
									<p className="invisible border p-1">{itemDraft.text || `filler`}</p>
									<Input.TextArea
										value={itemDraft.text}
										onChange={(e) => void setItemDraft((item) => ({name: item!.name, text: e.target.value}))}
										className="absolute inset-0"
									/>
								</div>
							</Card>
						)}
					</Masonry>
				)}

				{currentItems && currentItems.length === 0 && !itemDraft && (
					<div className="grid grow place-items-center">
						<div
							style={{
								boxShadow: `0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)`,
							}}
							className="rounded-md bg-white px-20 py-4"
						>
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
						</div>
					</div>
				)}
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentTab}
				onChange={(key: `auditory` | `cognitive` | `physical` | `speech` | `visual`) => {
					setCurrentTab(key)
					setMissionStatement(activeProduct?.accessibilityMissionStatements[key] ?? ``)
				}}
				items={[
					{key: `auditory`, label: `Auditory`},
					{key: `cognitive`, label: `Cognitive`},
					{key: `physical`, label: `Physical`},
					{key: `speech`, label: `Speech`},
					{key: `visual`, label: `Visual`},
				]}
			/>
		</div>
	)
}

export default Accessibility
