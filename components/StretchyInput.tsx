import type {FC, ReactNode} from "react"

export type StretchyInputProps = {
	children: ReactNode
	text: string
	className?: string
}

const StretchyInput: FC<StretchyInputProps> = ({children, text, className}) => {
	return (
		<div className="relative">
			<p className={className}>{text.replace(/\n(?!\n)$/m, `\nfiller`) || `filler`}</p>
			<div className="absolute inset-0 grid place-items-stretch">{children}</div>
		</div>
	)
}

export default StretchyInput
