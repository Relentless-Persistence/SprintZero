"use client"

import {Breadcrumb, Card, Tabs} from "antd"
import {doc} from "firebase/firestore"
import {useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"

import LinkTo from "~/components/LinkTo"
import {ProductConverter} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const descriptions = {
	auditory: `Auditory disabilities range from mild or moderate hearing loss in one or both ears ("hard of hearing") to substantial and uncorrectable hearing loss in both ears ("deafness"). Some people with auditory disabilities can hear sounds but sometimes not sufficiently to understand all speech, especially when there is background noise. This can include people using hearing aids.`,
	cognitive: `Cognitive, learning, and neurological disabilities involve neurodiversity and neurological disorders, as well as behavioral and mental health disorders that are not necessarily neurological. They may affect any part of the nervous system and impact how well people hear, move, see, speak, and understand information. Cognitive, learning, and neurological disabilities do not necessarily affect the intelligence of a person.`,
	physical: `Physical disabilities (sometimes called "motor disabilities") include weakness and limitations of muscular control (such as involuntary movements including tremors, lack of coordination, or paralysis), limitations of sensation, joint disorders (such as arthritis), pain that impedes movement, and missing limbs.`,
	speech: `Speech disabilities include difficulty producing speech that is recognizable by others or by voice recognition software. For example, the loudness or clarity of someone's voice might be difficult to understand.`,
	visual: `Visual disabilities range from mild or moderate vision loss in one or both eyes ("low vision") to substantial and uncorrectable vision loss in both eyes ("blindness"). Some people have reduced or lack of sensitivity to certain colors ("color blindness"), or increased sensitivity to bright colors. These variations in perception of colors and brightness can be independent of the visual acuity.`,
}

const AccessibilityPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [currentTab, setCurrentTab] = useState<`auditory` | `cognitive` | `physical` | `speech` | `visual`>(`auditory`)

	const [activeProduct] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex h-full flex-col gap-6 px-12 py-8">
				<Breadcrumb>
					<Breadcrumb.Item>Strategy</Breadcrumb.Item>
					<Breadcrumb.Item>Accessibility</Breadcrumb.Item>
					<Breadcrumb.Item className="capitalize">{currentTab}</Breadcrumb.Item>
				</Breadcrumb>

				<p className="text-gray">
					{descriptions[currentTab]}
					{` `}To learn more visit{` `}
					<span className="font-semibold text-[#2d73c8]">
						<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
							WCAG 2.1 at a Glance
						</LinkTo>
					</span>
				</p>

				<Masonry
					breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
					className="flex gap-8"
					columnClassName="bg-clip-padding flex flex-col gap-8"
				>
					<Card type="inner" title="One">
						<p>Images, controls, and other structural elements that do not have equivalent text alternatives.</p>
					</Card>
				</Masonry>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={currentTab}
				onChange={(key: `auditory` | `cognitive` | `physical` | `speech` | `visual`) => {
					setCurrentTab(key)
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

export default AccessibilityPage
