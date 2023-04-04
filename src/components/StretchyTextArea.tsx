import { Input } from "antd"
import { forwardRef } from "react"

import type { TextAreaProps } from "antd/es/input"
import type { ForwardRefRenderFunction } from "react"

export type StretchyTextAreaProps = Omit<TextAreaProps, `value` | `ref` | `children`> & {
	value: string
	minHeight?: string
}

const StretchyTextArea: ForwardRefRenderFunction<HTMLTextAreaElement, StretchyTextAreaProps> = (
	{ minHeight, style, ...props },
	ref,
) => {
	return (
		<div className="relative">
			<p className="py-[5px] px-[12px]" style={{ minHeight }}>
				{props.value.replace(/\n(?!\n)$/m, `\nfiller`) || `filler`}
			</p>
			<div className="absolute inset-0 grid place-items-stretch [&>span>textarea]:bg-transparent [&>span]:absolute [&>span]:inset-0">
				<Input.TextArea {...props} style={{ resize: `none`, ...style }} ref={ref} />
			</div>
		</div>
	)
}

export default forwardRef(StretchyTextArea)
