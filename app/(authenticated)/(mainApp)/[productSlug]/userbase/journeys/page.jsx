/* eslint-disable no-negated-condition */
"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import {Input, Select, Button, InputNumber, notification, Breadcrumb} from "antd"
import {findIndex} from "lodash"
import {useState, useEffect} from "react"
import styled from "styled-components"

import {Chart} from "~/components/Dashboard/Journeys"
import AddEvent from "~/components/Dashboard/Journeys/AddEvent"
import {splitRoutes} from "~/utils"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const {Option} = Select

const Versions = styled.ul`
	list-style: none;
	color: #262626;
	font-size: 16px;
`

const Version = styled.li`
	border-left-width: 4px;
	border-left-style: solid;
	border-left-color: ${(props) => (props.active ? `#315613` : `#3156131a`)};
	cursor: pointer;
	padding-bottom: 28px;
	font-style: normal;
	font-weight: 400;
	font-size: 16px;
	line-height: 24px;
	list-style: none;
`

const AddSide = styled(Button)`
	background: transparent !important ;
	border: none;
	color: #262626 !important ;
	box-shadow: none;
	font-size: 16px;
	line-height: 24px;
	margin: 0;
	padding: 0;
	text-align: start;
	font-weight: 600;
`

const capitalize = (text) => `${text[0]?.toUpperCase()}${text?.substring(1).toLowerCase()}`

export default function Journeys() {
	const activeProductId = useActiveProductId()
	const [journeys, setJourneys] = useState(null)
	const [events, setEvents] = useState(null)
	const [rightNav, setRightNav] = useState([])
	const [showDrawer, setShowDrawer] = useState(false)
	const [addJourney, setAddJourney] = useState(false)
	const [personas, setPersonas] = useState(null)
	const [breadCrumb, setBreadCrumb] = useState(null)

	// New Journey States
	const [newJourney, setNewJourney] = useState(``)
	const [duration, setDuration] = useState(``)
	const [durationType, setDurationType] = useState(`days`)

	const [activeJourney, setActiveJourney] = useState(null)

	useEffect(() => {
		if (activeJourney) {
			setBreadCrumb(splitRoutes(`userbase/learnings/${activeJourney.name}`))
		} else {
			setBreadCrumb(splitRoutes(`userbase/learnings`))
		}
	}, [activeJourney])

	const fetchJourneys = async () => {
		if (activeProductId) {
			db.collection(`Journeys`)
				.where(`product_id`, `==`, activeProductId)
				.onSnapshot((snapshot) => {
					setJourneys(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
					const journeys = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}))
					if (!snapshot.empty) {
						setActiveJourney(journeys[0])
						setAddJourney(false)
					} else {
						setAddJourney(true)
					}
				})
		}
	}

	useEffect(() => {
		fetchJourneys()
	}, [activeProductId])

	const fetchEvents = async () => {
		if (activeJourney) {
			db.collection(`journeyEvents`)
				.where(`journey_id`, `==`, activeJourney.id)
				.onSnapshot((snapshot) => {
					setEvents(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
		}
	}

	useEffect(() => {
		fetchEvents()
	}, [activeJourney])

	const getNames = () => {
		// return data.map((d) => d.role);
		if (journeys) {
			setRightNav(journeys.map(({name}) => name))
		}
	}

	useEffect(() => {
		getNames()
	}, [journeys])

	const fetchPersonas = async () => {
		let participants = []
		if (activeProductId) {
			db.collection(`Personas`)
				.where(`product_id`, `==`, activeProductId)
				.onSnapshot((snapshot) => {
					const personas = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}))
					for (let i = 0; i < personas.length; i++) {
						participants.push({
							label: personas[i].role,
							checked: false,
						})
					}
					setPersonas(participants)
				})
		}
	}

	useEffect(() => {
		fetchPersonas()
	}, [activeProductId, showDrawer])

	const setJourney = (journeyName) => {
		const journeyIndex = findIndex(journeys, (r) => r.name === journeyName)

		if (journeyIndex > -1) {
			setActiveJourney(journeys[journeyIndex])
		}
	}

	const onAddJourney = (e) => {
		e.preventDefault()
		const newJ = {
			durationType,
			duration,
			start: new Date().toISOString(),
			name: capitalize(newJourney),
			product_id: activeProductId,
		}

		if (duration !== `` && newJourney !== ``) {
			db.collection(`Journeys`)
				.add(newJ)
				.then(() => {
					setNewJourney(``)
					setDuration(``)
					setDurationType(``)
					setAddJourney(false)
				})
		} else {
			notification.error({message: `Please fill all required field`})
		}
	}

	const addEvent = (event) => {
		const data = {
			journey_id: activeJourney.id,
			...event,
		}
		db.collection(`journeyEvents`)
			.add(data)
			.then(() => {
				setShowDrawer(false)
			})
	}

	const checkJourney = () => {
		return activeJourney?.start && activeJourney?.duration && activeJourney?.durationType
	}

	const onClickAddEvt = async () => {
		await fetchPersonas()
		setShowDrawer(true)
	}

	const onCancel = () => {
		setNewJourney(``)
		setDuration(``)
		setDurationType(``)
		if (journeys.length >= 1) {
			setAddJourney(false)
		}
	}

	return (
		<div className="flex items-start justify-between">
			<div className="w-full py-[24px] px-[42px]">
				<div className="mb-4 flex items-center justify-between">
					{breadCrumb && (
						<Breadcrumb>
							{breadCrumb.map((item, i) => (
								<Breadcrumb.Item className="capitalize" key={i}>
									{item}
								</Breadcrumb.Item>
							))}
						</Breadcrumb>
					)}

					<div>
						{journeys && journeys.length > 0 && (
							<Button
								className="bg-white hover:border-none hover:text-black"
								onClick={checkJourney() ? onClickAddEvt : () => alert(`Configure journey details`)}
							>
								Add Event
							</Button>
						)}
					</div>
				</div>

				<div>
					{addJourney ? (
						<div className="flex h-[420px] items-center justify-center">
							<form onSubmit={onAddJourney}>
								<div className="w-[320px]">
									<div className="mb-8">
										<h3 className="mb-[11px] text-[24px] font-bold">Create Journey</h3>
										<p className="mb-2 text-[14px] text-[#595959]">Please provide a name</p>
										<Input
											value={newJourney}
											onChange={(e) => setNewJourney(e.target.value)}
											required
											placeholder="Name"
										/>
									</div>

									<p className="mt-8 mb-2 text-[14px] text-[#595959]">How long does this take end to end?</p>
									<div className="flex items-center justify-between space-x-3">
										<InputNumber
											value={duration}
											onChange={(value) => setDuration(value)}
											className="w-full"
											required
											placeholder="5"
										/>
										<Select defaultValue="days" onChange={(value) => setDurationType(value)} className="w-full">
											<Option value="minutes">Minutes</Option>
											<Option value="hours">Hours</Option>
											<Option value="days">Days</Option>
											<Option value="week">Weeks</Option>
											<Option value="month">Months</Option>
											<Option value="year">Years</Option>
										</Select>
									</div>
									<div className="mt-[43px] flex justify-end space-x-2">
										<Button size="small" onClick={onCancel}>
											Cancel
										</Button>
										<Button
											className="border-[#4A801D] bg-[#4A801D] text-[14px] text-white hover:bg-[#5A9D24] hover:text-white"
											size="small"
											onClick={onAddJourney}
											htmlType="submit"
										>
											Submit
										</Button>
									</div>
								</div>
							</form>
						</div>
					) : (
						<>
							{activeJourney && events && <Chart journey={activeJourney} events={events} />}

							{personas && activeJourney ? (
								<AddEvent
									onAdd={addEvent}
									journeyStart={activeJourney?.start}
									journeyDur={activeJourney?.duration}
									journeyType={activeJourney?.durationType}
									onCancel={() => setShowDrawer(false)}
									showDrawer={showDrawer}
									personas={personas}
								/>
							) : null}
						</>
					)}
				</div>
			</div>

			<div className="w-auto">
				<div>
					<Versions>
						{rightNav &&
							rightNav.map((item, i) => (
								<Version
									className={`py-[16px] px-[24px]  ${activeJourney === item ? `font-[600]` : ``}`}
									key={i}
									active={activeJourney.name === item}
									onClick={setJourney}
								>
									{item.render ? item.render() : item}
								</Version>
							))}
					</Versions>

					<Version className="py-[16px] px-[24px]">
						<AddSide onClick={() => setAddJourney(true)}>Add</AddSide>
					</Version>
				</div>
			</div>
		</div>
	)
}
