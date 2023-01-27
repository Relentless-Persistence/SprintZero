"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import {Row, Col, Breadcrumb} from "antd5"
import {useAtomValue} from "jotai"
import {useState, useEffect} from "react"
import styled from "styled-components"


import HuddleCard from "~/components/Huddle"
import {db} from "~/config/firebase-config"
import {splitRoutes} from "~/utils"
import {activeProductAtom} from "~/utils/atoms"
import {useActiveProductId} from "~/utils/useActiveProductId"

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
`

function subtractDays(numOfDays, date_today) {
	let datee = new Date(date_today)
	datee.setDate(datee.getDate() - numOfDays)

	return datee
}

const intervals = [`Today`, `Yesterday`, `2 days ago`, `3 days ago`, `1 week ago`, `2 weeks ago`, `1 month ago`]


const today_fixeddd = new Date(new Date().toJSON().slice(0, 10))
const yesterday_fixed = subtractDays(1, today_fixeddd)
const twodaysago_fixed = subtractDays(2, today_fixeddd)
const threedaysago_fixed = subtractDays(3, today_fixeddd)
const oneweekago_fixed = subtractDays(7, today_fixeddd)
const twoweeksago_fixed = subtractDays(14, today_fixeddd)
const onemonthago_fixed = subtractDays(30, today_fixeddd)

const intervals_dictt = {
	Today: today_fixeddd,
	Yesterday: yesterday_fixed,
	"2 days ago": twodaysago_fixed,
	"3 days ago": threedaysago_fixed,
	"1 week ago": oneweekago_fixed,
	"2 weeks ago": twoweeksago_fixed,
	"1 month ago": onemonthago_fixed,
}

// const intervals_dictt = [
//   today_fixeddd,
//   yesterday_fixed,
//   twodaysago_fixed,
//   threedaysago_fixed,
//   sevendaysago_fixed,
//   onemonthago_fixed,
// ];

export default function Huddle() {
	const activeProductId = useActiveProductId()
	const team = useAtomValue(activeProductAtom)?.members
	const [data, setData] = useState([])
	const [blockers, setBlockers] = useState(null)
	const [activeTime, setActiveTime] = useState(`Today`)
	const [todayInTime, setTodayInTime] = useState(null)
	const [yesterdayInTime, setYesterdayInTime] = useState(null)
	const [breadCrumb, setBreadCrumb] = useState(null)

	useEffect(() => {
		if (activeTime) {
			setBreadCrumb(splitRoutes(`operations/huddle/${activeTime}`))
		}
	}, [activeTime])

	// Fetch data from firebase
	const fetchHuddles = () => {
		if (activeProductId) {
			db.collection(`Huddles`)
				.where(`product_id`, `==`, activeProductId)
				.onSnapshot((snapshot) => {
					setData(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				})
		}
	}

	const fetchHuddleBlockers = () => {
		if (activeProductId) {
			db.collection(`HuddleBlockers`)
				.where(`product_id`, `==`, activeProductId)
				.onSnapshot((snapshot) => {
					setBlockers(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
					// console.log(
					//   snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
					// );
				})
		}
	}

	useEffect(() => {
		fetchHuddles()
		fetchHuddleBlockers()

		setTodayInTime(intervals_dictt[activeTime].setHours(0, 0, 0, 0))
		setYesterdayInTime(subtractDays(1, intervals_dictt[activeTime]).setHours(0, 0, 0, 0))
	}, [activeProductId, activeTime])

	return (
		<div className="flex items-start justify-between">
			<div className="w-full overflow-x-auto">
				<div className="px-[42px] pt-[24px]">
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
					</div>

					<div>
						<Row className="max-w-[1200px] overflow-x-auto" gutter={[16, 16]}>
							{team && data && blockers && (
								<>
									{team?.map((item, index) => (
										<Col className="flex" key={index} span={8}>
											<HuddleCard
												todayInTime={todayInTime}
												yesterdayInTime={yesterdayInTime}
												today={data.filter(
													(huddle) =>
														huddle.user.id === item.userId &&
														//isToday(huddle.createdAt)
														//((intervals_dict[activeTime]).setHours(0,0,0,0) == huddle.createdAt.toDate().setHours(0,0,0,0))
														todayInTime === huddle.createdAt.toDate().setHours(0, 0, 0, 0),
												)}
												yesterday={data.filter(
													(huddle) =>
														huddle.user.id === item.userId &&
														yesterdayInTime === huddle.createdAt.toDate().setHours(0, 0, 0, 0),
													//((subtractDays(1, intervals_dict[activeTime])).setHours(0,0,0,0) == huddle.createdAt.toDate().setHours(0,0,0,0))
													//isYesterday(huddle.createdAt)
												)}
												member={item}
												product={activeProductId}
												blockers={blockers.filter(
													(blocker) =>
														blocker.user.id === item.userId &&
														todayInTime === blocker.createdAt.toDate().setHours(0, 0, 0, 0),
												)}
											/>
										</Col>
									))}
								</>
							)}
						</Row>
					</div>
				</div>
			</div>

			<div className="w-[140px]">
				<div className="">
					<Versions>
						{intervals.map((item, i) => (
							<Version
								className={`py-[16px] px-[24px] text-sm  ${activeTime === item ? `font-[600]` : ``}`}
								key={i}
								active={activeTime === item}
								onClick={() => setActiveTime(item)}
							>
								{item.render ? item.render() : item}
							</Version>
						))}
					</Versions>
				</div>
			</div>
		</div>
	)
}
