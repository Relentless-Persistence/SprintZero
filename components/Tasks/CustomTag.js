import {Alert} from "antd"
import React from "react"

const CustomTag = ({shortTitle, due_date}) => {
	return (
		<div className="w-full rounded border border-[#A6AE9D] bg-[#FAFAFA] py-2 px-[10px]">
			<p className="text-xs font-semibold text-[#101D06]">{shortTitle}</p>
			<span className="rounded-[1.25532px] border border-[#AEE383] bg-[#E1F4D1] py-[0.5px] px-[4.5px] text-[#315613]">
				{due_date}
			</span>
		</div>
	)
}

export default CustomTag
