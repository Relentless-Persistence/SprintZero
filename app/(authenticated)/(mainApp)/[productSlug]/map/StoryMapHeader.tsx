import {Breadcrumb} from "antd"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {useState} from "react"
import {useInterval} from "react-use"

import type {Dayjs} from "dayjs"
import type {FC} from "react"

dayjs.extend(relativeTime)

export type StoryMapHeaderProps = {
	versionName?: string
	lastUpdated: Dayjs | undefined
}

const StoryMapHeader: FC<StoryMapHeaderProps> = ({versionName, lastUpdated}) => {
	const [lastUpdatedText, setLastUpdatedText] = useState<string | undefined>(undefined)
	useInterval(() => {
		if (lastUpdated !== undefined) setLastUpdatedText(lastUpdated.fromNow())
	}, 1000)

	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between gap-4 px-12 pt-8">
				<Breadcrumb>
					<Breadcrumb.Item>Story Map</Breadcrumb.Item>
					<Breadcrumb.Item>{versionName}</Breadcrumb.Item>
				</Breadcrumb>
				{lastUpdatedText && <p className="text-sm italic text-gray">Last updated {lastUpdatedText}</p>}
			</div>
			<div className="px-12 text-gray">
				<svg className="h-3 w-full">
					<svg viewBox="-16 -12 132 124" width="10" height="100%" preserveAspectRatio="none">
						<path
							d="M 100 0 L 0 50 L 100 100"
							vectorEffect="non-scaling-stroke"
							className="fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
						/>
					</svg>
					<line
						x1="2px"
						y1="50%"
						x2="calc(100% - 2px)"
						y2="50%"
						className="stroke-current stroke-[1.5] [stroke-dasharray:6_2]"
					/>
					<svg viewBox="-16 -12 132 124" x="calc(100% - 10px)" width="10" height="100%" preserveAspectRatio="none">
						<path
							d="M 0 0 L 100 50 L 0 100"
							vectorEffect="non-scaling-stroke"
							className="fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
						/>
					</svg>
				</svg>
				<div className="mt-2 flex justify-between text-sm">
					<p>Highest value</p>
					<p>Lowest value</p>
				</div>
			</div>
		</div>
	)
}

export default StoryMapHeader
