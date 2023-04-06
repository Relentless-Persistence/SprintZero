"use client"

import { CheckOutlined, CloseOutlined } from "@ant-design/icons"
import { Breadcrumb, Card, Switch, Tabs } from "antd"
import { updateDoc } from "firebase/firestore"
import produce from "immer"
import Masonry from "react-masonry-css"

import { FC, useState } from "react"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import LinkTo from "~/components/LinkTo"

const AccessibilityClientPage: FC = () => {
	const { product } = useAppContext()
	const [currentAccessibilityId, setCurrentAccessibilityId] = useState<string | undefined>('auditory')


	return (
		<>
			{
				currentAccessibilityId === `auditory` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-4">
						<div className="flex flex-col gap-2">
							<Breadcrumb items={[{ title: `Strategy` }, { title: `Accessibility` }, { title: `Auditory` }]} />

							<div className="leading-normal">
								<h1 className="text-4xl font-semibold">Web content accessibility guidelines</h1>
								<p className="text-sm text-textSecondary">
									Auditory disabilities range from mild or moderate hearing loss in one or both ears (&quot;hard of
									hearing&quot;) to substantial and uncorrectable hearing loss in both ears (&quot;deafness&quot;).
									Some people with auditory disabilities can hear sounds but sometimes not sufficiently to understand
									all speech, especially when there is background noise. This can include people using hearing aids.
									To learn more visit{` `}
									<span className="font-semibold text-info">
										<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
											WCAG at a Glance
										</LinkTo>
									</span>
								</p>
							</div>
						</div>
					</div>
				)
			}

			{
				currentAccessibilityId === `cognitive` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-4">
						<div className="flex flex-col gap-2">
							<Breadcrumb items={[{ title: `Strategy` }, { title: `Accessibility` }, { title: `Cognitive` }]} />

							<div className="leading-normal">
								<h1 className="text-4xl font-semibold">Web content accessibility guidelines</h1>
								<p className="text-sm text-textSecondary">
									Cognitive, learning, and neurological disabilities involve neurodiversity and neurological
									disorders, as well as behavioral and mental health disorders that are not necessarily neurological.
									They may affect any part of the nervous system and impact how well people hear, move, see, speak,
									and understand information. Cognitive, learning, and neurological disabilities do not necessarily
									affect the intelligence of a person. To learn more visit{` `}
									<span className="font-semibold text-info">
										<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
											WCAG at a Glance
										</LinkTo>
									</span>
								</p>
							</div>
						</div>
					</div>
				)
			}

			{
				currentAccessibilityId === `physical` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-4">
						<div className="flex flex-col gap-2">
							<Breadcrumb items={[{ title: `Strategy` }, { title: `Accessibility` }, { title: `Physical` }]} />

							<div className="leading-normal">
								<h1 className="text-4xl font-semibold">Web content accessibility guidelines</h1>
								<p className="text-sm text-textSecondary">
									Physical disabilities (sometimes called &quot;motor disabilities&quot;) include weakness and
									limitations of muscular control (such as involuntary movements including tremors, lack of
									coordination, or paralysis), limitations of sensation, joint disorders (such as arthritis), pain
									that impedes movement, and missing limbs. To learn more visit{` `}
									<span className="font-semibold text-info">
										<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
											WCAG at a Glance
										</LinkTo>
									</span>
								</p>
							</div>
						</div>
					</div>
				)
			}

			{
				currentAccessibilityId === `speech` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-4">
						<div className="flex flex-col gap-2">
							<Breadcrumb items={[{ title: `Strategy` }, { title: `Accessibility` }, { title: `Speech` }]} />

							<div className="leading-normal">
								<h1 className="text-4xl font-semibold">Web content accessibility guidelines</h1>
								<p className="text-sm text-textSecondary">
									Speech disabilities include difficulty producing speech that is recognizable by others or by voice
									recognition software. For example, the loudness or clarity of someone&apos;s voice might be
									difficult to understand. To learn more visit{` `}
									<span className="font-semibold text-info">
										<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
											WCAG at a Glance
										</LinkTo>
									</span>
								</p>
							</div>
						</div>
					</div>
				)
			}

			{
				currentAccessibilityId === `visual` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-4">
						<div className="flex flex-col gap-2">
							<Breadcrumb items={[{ title: `Strategy` }, { title: `Accessibility` }, { title: `Visual` }]} />

							<div className="leading-normal">
								<h1 className="text-4xl font-semibold">Web content accessibility guidelines</h1>
								<p className="text-sm text-textSecondary">
									Visual disabilities range from mild or moderate vision loss in one or both eyes (&quot;low
									vision&quot;) to substantial and uncorrectable vision loss in both eyes (&quot;blindness&quot;).
									Some people have reduced or lack of sensitivity to certain colors (&quot;color blindness&quot;), or
									increased sensitivity to bright colors. These variations in perception of colors and brightness can
									be independent of the visual acuity. To learn more visit{` `}
									<span className="font-semibold text-info">
										<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
											WCAG at a Glance
										</LinkTo>
									</span>
								</p>
							</div>
						</div>
					</div>
				)
			}

			{
				currentAccessibilityId === `mobile` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-4">
						<div className="flex flex-col gap-2">
							<Breadcrumb items={[{ title: `Strategy` }, { title: `Accessibility` }, { title: `Mobile` }]} />

							<div className="leading-normal">
								<h1 className="text-4xl font-semibold">Web content accessibility guidelines</h1>
								<p className="text-sm text-textSecondary">
									Visual disabilities range from mild or moderate vision loss in one or both eyes (&quot;low
									vision&quot;) to substantial and uncorrectable vision loss in both eyes (&quot;blindness&quot;).
									Some people have reduced or lack of sensitivity to certain colors (&quot;color blindness&quot;), or
									increased sensitivity to bright colors. These variations in perception of colors and brightness can
									be independent of the visual acuity. To learn more visit{` `}
									<span className="font-semibold text-info">
										<LinkTo href="https://www.w3.org/WAI/standards-guidelines/wcag/glance/" openInNewTab>
											WCAG at a Glance
										</LinkTo>
									</span>
								</p>
							</div>
						</div>
					</div>
				)
			}

			<div className="flex flex-col overflow-auto px-12 py-0">
				<Tabs
					tabPosition="top"
					activeKey={currentAccessibilityId}
					onChange={(key) => {
						setCurrentAccessibilityId(key)
					}}
					items={
						[
							{
								key: 'auditory',
								label: 'Auditory'
							},
							{
								key: 'cognitive',
								label: 'Cognitive'
							},
							{
								key: 'physical',
								label: 'Physical'
							},
							{
								key: 'speech',
								label: 'Speech'
							},
							{
								key: 'visual',
								label: 'Visual'
							},
							{
								key: 'mobile',
								label: 'Mobile'
							},
						]
					}
				/>
			</div>


			{
				currentAccessibilityId === `auditory` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-2">
						{product.exists() && (<Masonry
							breakpointCols={{ default: 4, 1700: 3, 1300: 2, 1000: 1 }}
							className="flex gap-8"
							columnClassName="flex flex-col gap-4"
						>
							<Card
								title="One"
								extra={
									<Switch
										checkedChildren={<CheckOutlined />}
										unCheckedChildren={<CloseOutlined />}
										checked={product.data().accessibility.auditory[0]}
										onChange={(checked) => {
											updateDoc(product.ref, {
												[`accessibility.auditory`]: produce(product.data().accessibility.auditory, (draft) => {
													draft[0] = checked
												}),
											}).catch(console.error)
										}}
									/>
								}
							>
								<p>Images, controls, and other structural elements that do not have equivalent text alternatives.</p>
							</Card>
							<Card
								title="Two"
								extra={
									<Switch
										checkedChildren={<CheckOutlined />}
										unCheckedChildren={<CloseOutlined />}
										checked={product.data().accessibility.auditory[1]}
										onChange={(checked) => {
											updateDoc(product.ref, {
												[`accessibility.auditory`]: produce(product.data().accessibility.auditory, (draft) => {
													draft[1] = checked
												}),
											}).catch(console.error)
										}}
									/>
								}
							>
								<p>Media players that do not display captions and that do not provide volume controls.</p>
							</Card>
							<Card
								title="Three"
								extra={
									<Switch
										checkedChildren={<CheckOutlined />}
										unCheckedChildren={<CloseOutlined />}
										checked={product.data().accessibility.auditory[2]}
										onChange={(checked) => {
											updateDoc(product.ref, {
												[`accessibility.auditory`]: produce(product.data().accessibility.auditory, (draft) => {
													draft[2] = checked
												}),
											}).catch(console.error)
										}}
									/>
								}
							>
								<p>Media players that do not provide options to adjust the text size and colors for captions.</p>
							</Card>
							<Card
								title="Four"
								extra={
									<Switch
										checkedChildren={<CheckOutlined />}
										unCheckedChildren={<CloseOutlined />}
										checked={product.data().accessibility.auditory[3]}
										onChange={(checked) => {
											updateDoc(product.ref, {
												[`accessibility.auditory`]: produce(product.data().accessibility.auditory, (draft) => {
													draft[3] = checked
												}),
											}).catch(console.error)
										}}
									/>
								}
							>
								<p>Web-based services, including web applications, that rely on interaction using voice only.</p>
							</Card>
							<Card
								title="Five"
								extra={
									<Switch
										checkedChildren={<CheckOutlined />}
										unCheckedChildren={<CloseOutlined />}
										checked={product.data().accessibility.auditory[4]}
										onChange={(checked) => {
											updateDoc(product.ref, {
												[`accessibility.auditory`]: produce(product.data().accessibility.auditory, (draft) => {
													draft[4] = checked
												}),
											}).catch(console.error)
										}}
									/>
								}
							>
								<p>Lack of sign language to supplement important information and text that is difficult to read.</p>
							</Card>
						</Masonry>)}
					</div>
				)
			}

			{
				currentAccessibilityId === `cognitive` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-2">
						{product.exists() && (
							<Masonry
								breakpointCols={{ default: 4, 1700: 3, 1300: 2, 1000: 1 }}
								className="flex gap-8"
								columnClassName="flex flex-col gap-4"
							>
								<Card
									title="One"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.cognitive[0]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.cognitive`]: produce(product.data().accessibility.cognitive, (draft) => {
														draft[0] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>Complex navigation mechanisms and page layouts that are difficult to understand and use.</p>
								</Card>
								<Card
									title="Two"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											checked={product.data().accessibility.cognitive[1]}
											unCheckedChildren={<CloseOutlined />}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.cognitive`]: produce(product.data().accessibility.cognitive, (draft) => {
														draft[1] = checked
													}),
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
									title="Three"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											checked={product.data().accessibility.cognitive[2]}
											unCheckedChildren={<CloseOutlined />}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.cognitive`]: produce(product.data().accessibility.cognitive, (draft) => {
														draft[2] = checked
													}),
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
									title="Four"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											checked={product.data().accessibility.cognitive[3]}
											unCheckedChildren={<CloseOutlined />}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.cognitive`]: produce(product.data().accessibility.cognitive, (draft) => {
														draft[3] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>Moving, blinking, or flickering content, and background audio that cannot be turned off.</p>
								</Card>
								<Card
									title="Five"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											checked={product.data().accessibility.cognitive[4]}
											unCheckedChildren={<CloseOutlined />}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.cognitive`]: produce(product.data().accessibility.cognitive, (draft) => {
														draft[4] = checked
													}),
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
									title="Six"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											checked={product.data().accessibility.cognitive[5]}
											unCheckedChildren={<CloseOutlined />}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.cognitive`]: produce(product.data().accessibility.cognitive, (draft) => {
														draft[5] = checked
													}),
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
				)
			}

			{
				currentAccessibilityId === `physical` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-2">
						{product.exists() && (
							<Masonry
								breakpointCols={{ default: 4, 1700: 3, 1300: 2, 1000: 1 }}
								className="flex gap-8"
								columnClassName="flex flex-col gap-4"
							>
								<Card
									title="One"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											checked={product.data().accessibility.physical[0]}
											unCheckedChildren={<CloseOutlined />}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.physical`]: produce(product.data().accessibility.physical, (draft) => {
														draft[0] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>Websites, web browsers, and authoring tools that do not provide full keyboard support.</p>
								</Card>
								<Card
									title="Two"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											checked={product.data().accessibility.physical[1]}
											unCheckedChildren={<CloseOutlined />}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.physical`]: produce(product.data().accessibility.physical, (draft) => {
														draft[1] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>Insufficient time limits to respond or to complete tasks, such as to fill out online forms.</p>
								</Card>
								<Card
									title="Three"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.physical[2]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.physical`]: produce(product.data().accessibility.physical, (draft) => {
														draft[2] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>Controls, including links with images of text, that do not have equivalent text alternatives.</p>
								</Card>
								<Card
									title="Four"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.physical[3]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.physical`]: produce(product.data().accessibility.physical, (draft) => {
														draft[3] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>Missing visual and non-visual orientation cues, page structure, and other navigational aids.</p>
								</Card>
								<Card
									title="Five"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.physical[4]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.physical`]: produce(product.data().accessibility.physical, (draft) => {
														draft[4] = checked
													}),
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
				)
			}

			{
				currentAccessibilityId === `speech` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-2">
						{product.exists() && (
							<Masonry
								breakpointCols={{ default: 4, 1700: 3, 1300: 2, 1000: 1 }}
								className="flex gap-8"
								columnClassName="flex flex-col gap-4"
							>
								<Card
									title="One"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.speech[0]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.speech`]: produce(product.data().accessibility.speech, (draft) => {
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
									title="Two"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.speech[1]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.speech`]: produce(product.data().accessibility.speech, (draft) => {
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
				)
			}

			{
				currentAccessibilityId === `visual` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-2">
						{product.exists() && (
							<Masonry
								breakpointCols={{ default: 4, 1700: 3, 1300: 2, 1000: 1 }}
								className="flex gap-8"
								columnClassName="flex flex-col gap-4"
							>
								<Card
									title="One"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.visual[0]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.visual`]: produce(product.data().accessibility.visual, (draft) => {
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
									title="Two"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.visual[1]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.visual`]: produce(product.data().accessibility.visual, (draft) => {
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
									title="Three"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.visual[2]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.visual`]: produce(product.data().accessibility.visual, (draft) => {
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
									title="Four"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.visual[3]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.visual`]: produce(product.data().accessibility.visual, (draft) => {
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
									title="Five"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.visual[4]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.visual`]: produce(product.data().accessibility.visual, (draft) => {
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
									title="Six"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.visual[5]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.visual`]: produce(product.data().accessibility.visual, (draft) => {
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
									title="Seven"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.visual[6]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.visual`]: produce(product.data().accessibility.visual, (draft) => {
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
									title="Eight"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.visual[7]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.visual`]: produce(product.data().accessibility.visual, (draft) => {
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
				)
			}

			{
				currentAccessibilityId === `mobile` && (
					<div className="flex flex-col gap-6 overflow-auto px-12 py-2">
						{product.exists() && (
							<Masonry
								breakpointCols={{ default: 4, 1700: 3, 1300: 2, 1000: 1 }}
								className="flex gap-8"
								columnClassName="flex flex-col gap-4"
							>
								<Card
									title="One"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.mobile[0]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.mobile`]: produce(product.data().accessibility.mobile, (draft) => {
														draft[0] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>
										Support landscape orientation display
									</p>
								</Card>
								<Card
									title="Two"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.mobile[1]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.mobile`]: produce(product.data().accessibility.mobile, (draft) => {
														draft[1] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>Add a button on a pin/code input</p>
								</Card>
								<Card
									title="Three"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.mobile[2]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.mobile`]: produce(product.data().accessibility.mobile, (draft) => {
														draft[2] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>Provide multiple ways to navigate a page</p>
								</Card>
								<Card
									title="Four"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.mobile[3]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.mobile`]: produce(product.data().accessibility.mobile, (draft) => {
														draft[3] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>The interface can be controlled with just one finger</p>
								</Card>
								<Card
									title="Five"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.mobile[4]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.mobile`]: produce(product.data().accessibility.mobile, (draft) => {
														draft[4] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>Avoid gesture-only to perform an action</p>
								</Card>
								<Card
									title="Six"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.mobile[5]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.mobile`]: produce(product.data().accessibility.mobile, (draft) => {
														draft[5] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>
										Support OS dynamic font scale
									</p>
								</Card>
								<Card
									title="Seven"
									extra={
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											checked={product.data().accessibility.mobile[6]}
											onChange={(checked) => {
												updateDoc(product.ref, {
													[`accessibility.mobile`]: produce(product.data().accessibility.mobile, (draft) => {
														draft[6] = checked
													}),
												}).catch(console.error)
											}}
										/>
									}
								>
									<p>
										Avoid automatic page refreshes
									</p>
								</Card>
							</Masonry>
						)}
					</div>
				)
			}
		</>
	)
}

export default AccessibilityClientPage