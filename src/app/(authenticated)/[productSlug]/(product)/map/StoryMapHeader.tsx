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
				<Breadcrumb items={[{title: `Story Map`}, {title: versionName}]} />
				{lastUpdatedText && <p className="text-sm italic text-textTertiary">Last updated {lastUpdatedText}</p>}
			</div>
			<div className="px-12 text-[#595959]">
				<div className="relative h-3 w-full">
					<svg viewBox="-16 -12 132 124" preserveAspectRatio="none" className="absolute top-0 left-0 h-full w-2">
						<path
							d="M 100 0 L 0 50 L 100 100"
							vectorEffect="non-scaling-stroke"
							className="fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
						/>
					</svg>
					<svg className="absolute top-0 left-0.5 h-full w-[calc(100%-4px)]">
						<line x1="0%" y1="50%" x2="100%" y2="50%" className="stroke-current stroke-[1.5] [stroke-dasharray:6_2]" />
					</svg>
					<svg viewBox="-16 -12 132 124" preserveAspectRatio="none" className="absolute right-0 top-0 h-full w-2">
						<path
							d="M 0 0 L 100 50 L 0 100"
							vectorEffect="non-scaling-stroke"
							className="fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
						/>
					</svg>
				</div>
				<div className="mt-2 flex justify-between text-sm">
					<p>Highest value</p>
					<p>Lowest value</p>
				</div>
			</div>
		</div>
	)
}

export default StoryMapHeader
