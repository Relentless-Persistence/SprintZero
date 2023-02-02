import React, {useRef, useState, useEffect} from "react"
import {Divider} from "antd"
import {Dot, Ellipse} from "./ellipse"

import {intervalToDuration} from "../../../utils/dateTimeHelpers"

const map = {
	year: "years",
	month: "months",
	week: "weeks",
	day: "days",
	hour: "hours",
	minute: "minutes",
	second: "seconds",
}

const Chart = ({journey, events}) => {
	const wrapper = useRef(null)
	const [chartWidth, setChartWidth] = useState(0)
	const jStart = journey?.start
	// const events = journey?.events;

	useEffect(() => {
		if (wrapper?.current) {
			setChartWidth(wrapper.current.getBoundingClientRect().width)
		}
	}, [])

	const getDims = (evtStart, evtEnd, evtLevel) => {
		const interval = intervalToDuration({
			start: new Date(jStart),
			end: new Date(evtStart),
		})

		const eInterval = intervalToDuration({
			start: new Date(evtStart),
			end: new Date(evtEnd),
		})

		const scale = interval[map[journey.durationType]]

		const diff = eInterval[map[journey.durationType]]

		const scaledWidth = (evtLevel / 100) * chartWidth * (2 / 3)

		const width = scaledWidth || 2 / 3

		const height = (diff / journey.duration) * 100
		const top = (scale / journey.duration) * 100

		return {
			top,
			width,
			height,
		}
	}

	return (
		<div
			style={{
				height: "65vh",
				marginLeft: "2%",
			}}
			ref={wrapper}
			className="relative mt-[30px]"
		>
			<Divider className="absolute top-0 left-0 m-0 w-2/3 min-w-[100px] border-dashed border-[#A6AE9D]" />

			<Divider type="vertical" className="absolute right-1/3 top-0 m-0 min-h-full border-[#A6AE9D]" />

			{events?.map((e) => {
				return <Ellipse key={e.id} event={e} dims={getDims(e.start, e.end, e.level)} journey={journey} />
			})}

			<Dot
				style={{
					top: 0,
					left: `${200 / 3}%`,
					transform: "translate(-50%,-50%)",
				}}
			/>

			<p className="absolute top-0 left-2/3 -translate-y-2/4 truncate pl-[14px] text-[12px] capitalize leading-[16px]">{`${journey?.durationType} 1`}</p>

			<Dot
				style={{
					top: "100%",
					left: `${200 / 3}%`,
					transform: "translate(-50%,-50%)",
				}}
			/>

			<p className="absolute bottom-0 left-2/3 translate-y-2/4 truncate pl-[14px] text-[12px] capitalize leading-[16px]">{`${journey?.durationType} ${journey?.duration}`}</p>

			{/* x labels */}

			<div className="absolute left-0 flex w-2/3 items-center justify-between py-[4px] pl-[2px] pr-[6px]">
				<p className="text-[12px] leading-[16px] text-[#A6AE9D]">High</p>

				<p className="text-[12px] leading-[16px] text-[#A6AE9D]">Low</p>
			</div>

			{/* y-labels */}

			<div
				style={{height: "112%", transform: "translateY(-5%)"}}
				className="absolute right-0 flex w-2/3 flex-col items-center justify-between"
			>
				<p className="text-[14px] font-[600] leading-[22px] text-[#A6AE9D]">Start</p>

				<p className="text-[14px] font-[600] leading-[22px] text-[#A6AE9D]">Finish</p>
			</div>

			{/* legends */}

			<div
				style={{
					left: "-10%",
					top: "50%",
					transform: "rotate(-90deg)",
				}}
				className="absolute flex items-center"
			>
				<div className="mr-[16px] flex items-center justify-between ">
					<p className="mr-[2px] text-[12px] font-[400] leading-[16px] text-[#8C8C8C]">Frustrated</p>
					<span
						style={{
							width: "24px",
							height: "11px",
							borderRadius: "12px",
							backgroundColor: "#FF4D4F",
						}}
					/>
				</div>

				<div className="justify-between] flex items-center">
					<p className="mr-[2px] text-[12px] font-[400] leading-[16px] text-[#8C8C8C]">Delighted</p>
					<span
						style={{
							width: "24px",
							height: "11px",
							borderRadius: "12px",
							backgroundColor: "#009CD5",
						}}
					/>
				</div>
			</div>
		</div>
	)
}

export {Chart}
