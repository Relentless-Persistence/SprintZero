"use client"

import {findIndex} from "lodash"
import Head from "next/head"
import {useRouter} from "next/router"
import {useState, useRef} from "react"

import AppLayout from "../../../../components/Dashboard/AppLayout"
import MainSub from "../../../../components/Dashboard/MainSub"
import {DraggableTab, DraggableContainer} from "../../../../components/Priorities"
import {db} from "../../../../config/firebase-config"
import {scaleToVal, splitRoutes} from "../../../../utils"

const names = [`Epics`, `Features`, `Stories`]

const getNames = () => {
	const names = [`Epics`, `Features`, `Stories`]

	return names
}

export default function Priorities() {
	const {pathname} = useRouter()
	const container = useRef()
	const [epics, setEpics] = useState()
	const [features, setFeatures] = useState()
	const [stories, setStories] = useState()
	const [visible, setVisible] = useState(false)

	const [activePriority, setActivePriority] = useState(names[0])
	const [disableDrag, setDisableDrag] = useState(true)
	const [activeData, setActiveData] = useState()

	const setPriority = (name) => {
		const index = findIndex(names, (o) => o === name)

		if (index > -1) {
			setActivePriority(names[index])
		}

		if (names[index] === `Epics`) {
			setActiveData(epics)
		} else if (names[index] === `Features`) {
			setActiveData(features)
		} else {
			setActiveData(stories)
		}
	}

	const toggleDisable = () => setDisableDrag((s) => !s)

	const toggleDrawer = (itemIndex) => {
		setVisible((s) => !s)
	}

	const onStop = (e, itemData, index) => {
		const node = itemData.node.getBoundingClientRect()
		const nodeWidth = node.width
		const nodeHeight = node.height

		const parent = container.current.getBoundingClientRect()
		const parentWidth = parent.width
		const parentHeight = parent.height

		const maxPossibleX = parentWidth - nodeWidth
		const maxPossibleY = parentHeight - nodeHeight

		const valX = scaleToVal(itemData.x, maxPossibleX)
		const valY = scaleToVal(itemData.y, maxPossibleY)

		if (activePriority === `Epics`) {
			epics[index].feasibility_level = valX
			epics[index].priority_level = 100 - valY

			db.collection(`Epics`)
				.doc(epics[index].id)
				.update(epics[index])
				.then(() => fetchEpics())
		} else if (activePriority === `Features`) {
			features[index].epic.features[features[index].featureIndex].feasibility_level = valX

			features[index].epic.features[features[index].featureIndex].priority_level = 100 - valY

			db.collection(`Epics`)
				.doc(features[index].epic.id)
				.update(features[index].epic)
				.then(() => fetchEpics())
		} else {
			stories[index].epic.features[stories[index].featureIndex].stories[stories[index].storyIndex].feasibility_level =
				valX

			stories[index].epic.features[stories[index].featureIndex].stories[stories[index].storyIndex].priority_level =
				100 - valY

			db.collection(`Epics`)
				.doc(stories[index].epic.id)
				.update(stories[index].epic)
				.then(() => fetchEpics())
		}
	}

	return (
		<div className="mb-8">
			<Head>
				<title>Dashboard | Sprint Zero</title>
				<meta name="description" content="Sprint Zero strategy tasks" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppLayout
				rightNavItems={getNames()}
				// onChangeProduct={setProduct}
				hasSideAdd={false}
				activeRightItem={activePriority}
				setActiveRightNav={setPriority}
				breadCrumbItems={splitRoutes(pathname)}
				hasMainAdd
				addNewText={disableDrag ? `Edit` : `Done`}
				mainClass="mr-[120px]"
				onMainAdd={toggleDisable}
			>
				<MainSub>
					Assess the practicality of proposed items to objectively and rationally uncover strengths and weaknesses,
					opportunities and threats, the resources required to carry through, and ultimately the prospects for success
				</MainSub>

				{epics && features && stories && (
					<DraggableContainer disable={disableDrag} ref={container}>
						{activePriority === `Epics`
							? epics.map((d, i) => (
									<DraggableTab
										onStop={onStop}
										ref={container}
										label={d.name}
										disable={disableDrag}
										index={i}
										onClickItem={toggleDrawer}
										val={{
											x: d.feasibility_level,
											y: d.priority_level,
										}}
										key={d.id}
									/>
							  ))
							: null}

						{activePriority === `Features`
							? features.map((d, i) => (
									<DraggableTab
										onStop={onStop}
										ref={container}
										label={d.name}
										disable={disableDrag}
										index={i}
										onClickItem={toggleDrawer}
										val={{
											x: d.feasibility_level,
											y: d.priority_level,
										}}
										key={d.id}
									/>
							  ))
							: null}

						{activePriority === `Stories`
							? stories.map((d, i) => (
									<DraggableTab
										onStop={onStop}
										ref={container}
										label={d.name}
										disable={disableDrag}
										index={i}
										onClickItem={toggleDrawer}
										val={{
											x: d.feasibility_level,
											y: d.priority_level,
										}}
										key={d.id}
									/>
							  ))
							: null}
					</DraggableContainer>
				)}
			</AppLayout>
		</div>
	)
}
