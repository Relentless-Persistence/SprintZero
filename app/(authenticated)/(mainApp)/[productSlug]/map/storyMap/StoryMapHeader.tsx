import {LeftOutlined, RightOutlined} from "@ant-design/icons"
import {Breadcrumb} from "antd"

import type {FC} from "react"

export type StoryMapHeaderProps = {
	versionName?: string
}

const StoryMapHeader: FC<StoryMapHeaderProps> = ({versionName}) => {
	return (
		<div className="flex flex-col gap-8">
			<Breadcrumb className="px-12 pt-8">
				<Breadcrumb.Item>Story Map</Breadcrumb.Item>
				<Breadcrumb.Item>{versionName}</Breadcrumb.Item>
			</Breadcrumb>
			<div className="px-12 text-laurel">
				<div className="relative text-[0.6rem]">
					<LeftOutlined className="absolute left-[-6px] -translate-y-1/2" />
					<div className="absolute top-1/2 h-0 w-full -translate-y-1/2 border-t-[1px] border-dashed border-laurel" />
					<RightOutlined className="absolute right-[-6px] -translate-y-1/2" />
				</div>
				<div className="mt-2 flex justify-between text-xs">
					<p>High value</p>
					<p>Low value</p>
				</div>
			</div>
		</div>
	)
}

export default StoryMapHeader
