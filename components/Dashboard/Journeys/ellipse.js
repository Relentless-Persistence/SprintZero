import React, {useState} from "react"
import EditEvent from "./EditEvent"

const Label = ({title, description, event, journey}) => {
	const longerThan = (val) => val?.toString().trim().length > 30
	const [editEvent, setEditEvent] = useState(false)

	return (
		<>
			<div
				style={{zIndex: 500}}
				className="absolute left-full top-1/2 w-1/3 -translate-y-2/4 cursor-pointer pl-[12px]"
				onClick={() => setEditEvent(true)}
			>
				<p className={`text-[12px] font-[600] leading-[20px] ${longerThan(title) ? "truncate" : ""}`}>{title}</p>
				<p className={`text-[12px] leading-[16px]  ${longerThan(description) ? "truncate" : ""}`}>{description}</p>
			</div>
			{editEvent && (
				<EditEvent
					event={event}
					editEvent={editEvent}
					setEditEvent={setEditEvent}
					journeyStart={journey?.start}
					journeyDur={journey?.duration}
					journeyType={journey?.durationType}
				/>
			)}
		</>
	)
}

const Dot = ({style}) => {
	return (
		<div
			style={{zIndex: 500, ...style}}
			className="absolute right-0 top-1/2 h-[10px] w-[10px] -translate-y-2/4 translate-x-2/4 rounded-full border-2 border-[#A6AE9D] bg-white"
		/>
	)
}

const Ellipse = ({event, dims, journey}) => {
	return (
		<div
			style={{
				top: `${dims.top}%`,
				height: `${dims.height}%`,
				width: `${dims.width}px`,
			}}
			className="absolute right-1/3"
		>
			<div style={{width: "100%", height: "100%"}} className="relative">
				<svg width="100%" height="100%">
					<ellipse
						fill={event.isDelighted ? "rgba(0,156,213,0.6)" : "rgba(255,77,79,.6)"}
						cx="100%"
						cy="50%"
						rx="100%"
						ry="50%"
					/>
				</svg>

				<Label title={event.title} description={event.description} event={event} journey={journey} />

				<Dot />
			</div>
		</div>
	)
}

export {Ellipse, Dot}
