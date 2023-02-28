"use client"

import {CheckOutlined} from "@ant-design/icons"
import {Breadcrumb, Card, Switch, Tabs} from "antd"
import {doc, updateDoc} from "firebase/firestore"
import produce from "immer"
import {useDocument} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"

import LinkTo from "~/components/LinkTo"
import {ProductConverter} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const AccessibilityClientPage: FC = () => {
	const activeProductId = useActiveProductId()

	const [activeProduct] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	return (
		<Tabs
			tabPosition="right"
			items={[
				{
					key: `auditory`,
					label: `Auditory`,
					children: (
						<div className="flex h-full flex-col gap-6 overflow-auto px-12 py-8">
							<Breadcrumb>
								<Breadcrumb.Item>Strategy</Breadcrumb.Item>
								<Breadcrumb.Item>Accessibility</Breadcrumb.Item>
								<Breadcrumb.Item>Auditory</Breadcrumb.Item>
							</Breadcrumb>

							<p className="text-textSecondary">
								Auditory disabilities range from mild or moderate hearing loss in one or both ears (&quot;hard of
								hearing&quot;) to substantial and uncorrectable hearing loss in both ears (&quot;deafness&quot;). Some
								people with auditory disabilities can hear sounds but sometimes not sufficiently to understand all
								speech, especially when there is background noise. This can include people using hearing aids. To learn
								more visit{` `}
								<span className="font-semibold text-info">
									<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
										WCAG 2.1 at a Glance
									</LinkTo>
								</span>
							</p>

							{activeProduct?.exists() && (
								<Masonry
									breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
									className="flex gap-8"
									columnClassName="bg-clip-padding flex flex-col gap-8"
								>
									<Card
										type="inner"
										title="One"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.auditory[0]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.auditory`]: produce(
															activeProduct.data().accessibility.auditory,
															(draft) => {
																draft[0] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>
											Images, controls, and other structural elements that do not have equivalent text alternatives.
										</p>
									</Card>
									<Card
										type="inner"
										title="Two"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.auditory[1]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.auditory`]: produce(
															activeProduct.data().accessibility.auditory,
															(draft) => {
																draft[1] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Media players that do not display captions and that do not provide volume controls.</p>
									</Card>
									<Card
										type="inner"
										title="Three"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.auditory[2]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.auditory`]: produce(
															activeProduct.data().accessibility.auditory,
															(draft) => {
																draft[2] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Media players that do not provide options to adjust the text size and colors for captions.</p>
									</Card>
									<Card
										type="inner"
										title="Four"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.auditory[3]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.auditory`]: produce(
															activeProduct.data().accessibility.auditory,
															(draft) => {
																draft[3] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Web-based services, including web applications, that rely on interaction using voice only.</p>
									</Card>
									<Card
										type="inner"
										title="Five"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.auditory[4]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.auditory`]: produce(
															activeProduct.data().accessibility.auditory,
															(draft) => {
																draft[4] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Lack of sign language to supplement important information and text that is difficult to read.</p>
									</Card>
								</Masonry>
							)}
						</div>
					),
				},
				{
					key: `cognitive`,
					label: `Cognitive`,
					children: (
						<div className="flex h-full flex-col gap-6 overflow-auto px-12 py-8">
							<Breadcrumb>
								<Breadcrumb.Item>Strategy</Breadcrumb.Item>
								<Breadcrumb.Item>Accessibility</Breadcrumb.Item>
								<Breadcrumb.Item>Cognitive</Breadcrumb.Item>
							</Breadcrumb>

							<p className="text-textSecondary">
								Cognitive, learning, and neurological disabilities involve neurodiversity and neurological disorders, as
								well as behavioral and mental health disorders that are not necessarily neurological. They may affect
								any part of the nervous system and impact how well people hear, move, see, speak, and understand
								information. Cognitive, learning, and neurological disabilities do not necessarily affect the
								intelligence of a person. To learn more visit{` `}
								<span className="font-semibold text-info">
									<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
										WCAG 2.1 at a Glance
									</LinkTo>
								</span>
							</p>

							{activeProduct?.exists() && (
								<Masonry
									breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
									className="flex gap-8"
									columnClassName="bg-clip-padding flex flex-col gap-8"
								>
									<Card
										type="inner"
										title="One"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.cognitive[0]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.cognitive`]: produce(
															activeProduct.data().accessibility.cognitive,
															(draft) => {
																draft[0] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Complex navigation mechanisms and page layouts that are difficult to understand and use.</p>
									</Card>
									<Card
										type="inner"
										title="Two"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.cognitive[1]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.cognitive`]: produce(
															activeProduct.data().accessibility.cognitive,
															(draft) => {
																draft[1] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>
											Complex sentences that are difficult to read and unusual words that are difficult to understand.
										</p>
									</Card>
									<Card
										type="inner"
										title="Three"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.cognitive[2]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.cognitive`]: produce(
															activeProduct.data().accessibility.cognitive,
															(draft) => {
																draft[2] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>
											Long passages of text without images, graphs, or other illustrations to highlight the context.
										</p>
									</Card>
									<Card
										type="inner"
										title="Four"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.cognitive[3]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.cognitive`]: produce(
															activeProduct.data().accessibility.cognitive,
															(draft) => {
																draft[3] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Moving, blinking, or flickering content, and background audio that cannot be turned off.</p>
									</Card>
									<Card
										type="inner"
										title="Five"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.cognitive[4]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.cognitive`]: produce(
															activeProduct.data().accessibility.cognitive,
															(draft) => {
																draft[4] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>
											Web browsers and media players that do not provide mechanisms to suppress animations and audio.
										</p>
									</Card>
									<Card
										type="inner"
										title="Six"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.cognitive[5]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.cognitive`]: produce(
															activeProduct.data().accessibility.cognitive,
															(draft) => {
																draft[5] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Visual page designs that cannot be adapted using web browser controls or custom style sheets.</p>
									</Card>
								</Masonry>
							)}
						</div>
					),
				},
				{
					key: `physical`,
					label: `Physical`,
					children: (
						<div className="flex h-full flex-col gap-6 overflow-auto px-12 py-8">
							<Breadcrumb>
								<Breadcrumb.Item>Strategy</Breadcrumb.Item>
								<Breadcrumb.Item>Accessibility</Breadcrumb.Item>
								<Breadcrumb.Item>Physical</Breadcrumb.Item>
							</Breadcrumb>

							<p className="text-textSecondary">
								Physical disabilities (sometimes called &quot;motor disabilities&quot;) include weakness and limitations
								of muscular control (such as involuntary movements including tremors, lack of coordination, or
								paralysis), limitations of sensation, joint disorders (such as arthritis), pain that impedes movement,
								and missing limbs. To learn more visit{` `}
								<span className="font-semibold text-info">
									<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
										WCAG 2.1 at a Glance
									</LinkTo>
								</span>
							</p>

							{activeProduct?.exists() && (
								<Masonry
									breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
									className="flex gap-8"
									columnClassName="bg-clip-padding flex flex-col gap-8"
								>
									<Card
										type="inner"
										title="One"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.physical[0]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.physical`]: produce(
															activeProduct.data().accessibility.physical,
															(draft) => {
																draft[0] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Websites, web browsers, and authoring tools that do not provide full keyboard support.</p>
									</Card>
									<Card
										type="inner"
										title="Two"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.physical[1]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.physical`]: produce(
															activeProduct.data().accessibility.physical,
															(draft) => {
																draft[1] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Insufficient time limits to respond or to complete tasks, such as to fill out online forms.</p>
									</Card>
									<Card
										type="inner"
										title="Three"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.physical[2]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.physical`]: produce(
															activeProduct.data().accessibility.physical,
															(draft) => {
																draft[2] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Controls, including links with images of text, that do not have equivalent text alternatives.</p>
									</Card>
									<Card
										type="inner"
										title="Four"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.physical[3]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.physical`]: produce(
															activeProduct.data().accessibility.physical,
															(draft) => {
																draft[3] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Missing visual and non-visual orientation cues, page structure, and other navigational aids.</p>
									</Card>
									<Card
										type="inner"
										title="Five"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.physical[4]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.physical`]: produce(
															activeProduct.data().accessibility.physical,
															(draft) => {
																draft[4] = checked
															},
														),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Inconsistent, unpredictable, and overly complicated navigation mechanisms and page functions.</p>
									</Card>
								</Masonry>
							)}
						</div>
					),
				},
				{
					key: `speech`,
					label: `Speech`,
					children: (
						<div className="flex h-full flex-col gap-6 overflow-auto px-12 py-8">
							<Breadcrumb>
								<Breadcrumb.Item>Strategy</Breadcrumb.Item>
								<Breadcrumb.Item>Accessibility</Breadcrumb.Item>
								<Breadcrumb.Item>Speech</Breadcrumb.Item>
							</Breadcrumb>

							<p className="text-textSecondary">
								Speech disabilities include difficulty producing speech that is recognizable by others or by voice
								recognition software. For example, the loudness or clarity of someone&apos;s voice might be difficult to
								understand. To learn more visit{` `}
								<span className="font-semibold text-info">
									<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
										WCAG 2.1 at a Glance
									</LinkTo>
								</span>
							</p>

							{activeProduct?.exists() && (
								<Masonry
									breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
									className="flex gap-8"
									columnClassName="bg-clip-padding flex flex-col gap-8"
								>
									<Card
										type="inner"
										title="One"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.speech[0]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.speech`]: produce(activeProduct.data().accessibility.speech, (draft) => {
															draft[0] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Web-based services, including web applications, that rely on interaction using voice only.</p>
									</Card>
									<Card
										type="inner"
										title="Two"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.speech[1]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.speech`]: produce(activeProduct.data().accessibility.speech, (draft) => {
															draft[1] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Websites that offer phone numbers as the only way to communicate with the organizations.</p>
									</Card>
								</Masonry>
							)}
						</div>
					),
				},
				{
					key: `visual`,
					label: `Visual`,
					children: (
						<div className="flex h-full flex-col gap-6 overflow-auto px-12 py-8">
							<Breadcrumb>
								<Breadcrumb.Item>Strategy</Breadcrumb.Item>
								<Breadcrumb.Item>Accessibility</Breadcrumb.Item>
								<Breadcrumb.Item>Visual</Breadcrumb.Item>
							</Breadcrumb>

							<p className="text-textSecondary">
								Visual disabilities range from mild or moderate vision loss in one or both eyes (&quot;low vision&quot;)
								to substantial and uncorrectable vision loss in both eyes (&quot;blindness&quot;). Some people have
								reduced or lack of sensitivity to certain colors (&quot;color blindness&quot;), or increased sensitivity
								to bright colors. These variations in perception of colors and brightness can be independent of the
								visual acuity. To learn more visit{` `}
								<span className="font-semibold text-info">
									<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
										WCAG 2.1 at a Glance
									</LinkTo>
								</span>
							</p>

							{activeProduct?.exists() && (
								<Masonry
									breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
									className="flex gap-8"
									columnClassName="bg-clip-padding flex flex-col gap-8"
								>
									<Card
										type="inner"
										title="One"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.visual[0]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.visual`]: produce(activeProduct.data().accessibility.visual, (draft) => {
															draft[0] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>
											Images, controls, and other structural elements that do not have equivalent text alternatives.
										</p>
									</Card>
									<Card
										type="inner"
										title="Two"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.visual[1]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.visual`]: produce(activeProduct.data().accessibility.visual, (draft) => {
															draft[1] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Text, images, and page layouts that cannot be resized, or that lose information when resized.</p>
									</Card>
									<Card
										type="inner"
										title="Three"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.visual[2]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.visual`]: produce(activeProduct.data().accessibility.visual, (draft) => {
															draft[2] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Missing visual and non-visual orientation cues, page structure, and other navigational aids.</p>
									</Card>
									<Card
										type="inner"
										title="Four"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.visual[3]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.visual`]: produce(activeProduct.data().accessibility.visual, (draft) => {
															draft[3] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Video content that does not have text or audio alternatives, or an audio-description track.</p>
									</Card>
									<Card
										type="inner"
										title="Five"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.visual[4]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.visual`]: produce(activeProduct.data().accessibility.visual, (draft) => {
															draft[4] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Inconsistent, unpredictable, and overly complicated navigation mechanisms and page functions.</p>
									</Card>
									<Card
										type="inner"
										title="Six"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.visual[5]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.visual`]: produce(activeProduct.data().accessibility.visual, (draft) => {
															draft[5] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>
											Text and images with insufficient contrast between foreground and background color combinations.
										</p>
									</Card>
									<Card
										type="inner"
										title="Seven"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.visual[6]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.visual`]: produce(activeProduct.data().accessibility.visual, (draft) => {
															draft[6] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>
											Websites, web browsers, and authoring tools that do not support the use of custom color
											combinations.
										</p>
									</Card>
									<Card
										type="inner"
										title="Eight"
										extra={
											<Switch
												checkedChildren={<CheckOutlined />}
												checked={activeProduct.data().accessibility.visual[7]}
												onChange={(checked) => {
													updateDoc(activeProduct.ref, {
														[`accessibility.visual`]: produce(activeProduct.data().accessibility.visual, (draft) => {
															draft[7] = checked
														}),
													}).catch(console.error)
												}}
											/>
										}
									>
										<p>Websites, web browsers, and authoring tools that do not provide full keyboard support.</p>
									</Card>
								</Masonry>
							)}
						</div>
					),
				},
			]}
			className="h-full"
		/>
	)
}

export default AccessibilityClientPage
