"use client"

import {GlobalOutlined} from "@ant-design/icons"
import {Button, Breadcrumb, Card, Input, Tabs} from "antd"
import {collection, doc, query, where} from "firebase/firestore"
import {useState, useEffect} from "react"
import {useCollectionData, useDocumentData} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {Id} from "~/types"

import AccessibilityItemCard from "./AccessibilityItemCard"
import LinkTo from "~/components/LinkTo"
import NoData from "~/components/NoData"
import {AccessibilityItemConverter, AccessibilityItems} from "~/types/db/AccessibilityItems"
import {ProductConverter, Products} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {addAccessibilityItem, updateProduct} from "~/utils/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const descriptions = {
	auditory: `Auditory disabilities range from mild or moderate hearing loss in one or both ears ("hard of hearing") to substantial and uncorrectable hearing loss in both ears ("deafness"). Some people with auditory disabilities can hear sounds but sometimes not sufficiently to understand all speech, especially when there is background noise. This can include people using hearing aids.`,
	cognitive: `Cognitive, learning, and neurological disabilities involve neurodiversity and neurological disorders, as well as behavioral and mental health disorders that are not necessarily neurological. They may affect any part of the nervous system and impact how well people hear, move, see, speak, and understand information. Cognitive, learning, and neurological disabilities do not necessarily affect the intelligence of a person.`,
	physical: `Physical disabilities (sometimes called "motor disabilities") include weakness and limitations of muscular control (such as involuntary movements including tremors, lack of coordination, or paralysis), limitations of sensation, joint disorders (such as arthritis), pain that impedes movement, and missing limbs.`,
	speech: `Speech disabilities include difficulty producing speech that is recognizable by others or by voice recognition software. For example, the loudness or clarity of someone's voice might be difficult to understand.`,
	visual: `Visual disabilities range from mild or moderate vision loss in one or both eyes ("low vision") to substantial and uncorrectable vision loss in both eyes ("blindness"). Some people have reduced or lack of sensitivity to certain colors ("color blindness"), or increased sensitivity to bright colors. These variations in perception of colors and brightness can be independent of the visual acuity.`,
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

				<p className="text-gray">
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

				{accessibilityItems && (
					<Masonry
						breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
						className="flex gap-8"
						columnClassName="bg-clip-padding flex flex-col gap-8"
					>
						{currentItems?.map((item) => (
							<AccessibilityItemCard
								key={item.id}
								item={item}
								isEditing={item.id === activeItemId && itemDraft !== undefined}
								onEditStart={() => {
									setItemDraft({name: item.name, text: item.text})
									setActiveItemId(item.id)
								}}
								onEditEnd={() => {
									setActiveItemId(undefined)
									setItemDraft(undefined)
								}}
							/>
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
											className="bg-green"
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
						<NoData />
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
