import {Empty} from "antd"

import type {FC} from "react"

const NoData: FC = () => {
	return (
		<div
			style={{
				boxShadow: `0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)`,
			}}
			className="rounded-md bg-white px-20 py-4"
		>
			<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
		</div>
	)
}

export default NoData
