import {RightOutlined, UpOutlined} from "@ant-design/icons"

import type {FC, ReactNode} from "react"

export type PrioritiesMatrixProps = {
	children: ReactNode
}

const PrioritiesMatrix: FC<PrioritiesMatrixProps> = ({children}) => {
	return (
		<div className="relative h-full">
			<div className="relative h-full w-0 text-[0.6rem] text-textTertiary">
				<UpOutlined className="absolute top-[-2px] -translate-x-1/2" />
				<div className="h-full w-px -translate-x-1/2 bg-textTertiary" />
				<p className="absolute top-4 -right-4 whitespace-nowrap text-xs [transform:rotate(-90deg)_translate(-50%,50%)]">
					High User Value
				</p>
				<p className="absolute bottom-0 -right-4 whitespace-nowrap text-xs [transform:rotate(-90deg)_translate(50%,50%)]">
					Low User Value
				</p>
			</div>
			<div className="relative h-0 w-full text-[0.6rem] text-textTertiary">
				<RightOutlined className="absolute right-[-2px] -translate-y-1/2" />
				<div className="h-px w-full -translate-y-1/2 bg-textTertiary" />
				<p className="absolute top-2 left-2 whitespace-nowrap text-xs">Low Effort</p>
				<p className="absolute top-2 right-2 whitespace-nowrap text-xs">High Effort</p>
			</div>
			<div className="absolute left-1/2 top-0 h-full border-r border-dashed border-textTertiary" />
			<div className="absolute left-0 top-1/2 w-full border-t border-dashed border-textTertiary" />

			<div className="absolute inset-0">{children}</div>
		</div>
	)
}

export default PrioritiesMatrix
