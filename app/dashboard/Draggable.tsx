import {motion} from "framer-motion"
import {forwardRef, useEffect, useRef, useState} from "react"
import ReactDOM from "react-dom"
import {usePreviousDistinct} from "react-use"

import type {ReactNode, FC, ForwardRefRenderFunction} from "react"

export type DraggableProps = {
	children: ReactNode
	onActiveStart: () => void
	onActiveEnd: () => void
}

const Draggable: ForwardRefRenderFunction<HTMLDivElement, DraggableProps> = (
	{children, onActiveStart, onActiveEnd},
	ref,
) => {
	// const [isHovering, setIsHovering] = useState(false)
	// const [isHolding, setIsHolding] = useState(false)
	// const isActive = isHovering || isHolding
	// const prevIsActive = usePreviousDistinct(isActive)
	// useEffect(() => {
	// 	if (isActive && !prevIsActive) onActiveStart()
	// 	if (!isActive && prevIsActive) onActiveEnd()
	// }, [isActive, onActiveEnd, onActiveStart, prevIsActive])

	return (
		<motion.div
			drag
			dragSnapToOrigin
			// onPointerMove={(e) => void setIsHovering(!(e.target as HTMLElement).hasAttribute(`data-nondraggable`))}
			// onPointerLeave={() => void setIsHovering(false)}
			// onPointerDown={(e) => {
			// 	if ((e.target as HTMLElement).hasAttribute(`data-nodraggable`)) e.stopPropagation()
			// 	setIsHolding(true)
			// }}
			// onPointerUp={() => void setIsHolding(false)}
			// onPointerCancel={() => void setIsHolding(false)}
			ref={ref}
		>
			{children}
		</motion.div>
	)
}

export type InputProps = {
	value: string
	onChange: (value: string) => void
}

const Input: FC<InputProps> = ({value, onChange}) => {
	const [textWidth, setTextWidth] = useState<number | null>(null)
	const referenceText = useRef<HTMLParagraphElement>(null)

	const updateTextWidth = () => {
		if (referenceText.current) setTextWidth(referenceText.current.offsetWidth)
	}

	useEffect(() => void updateTextWidth(), [value])

	return (
		<>
			<input
				data-nondraggable
				value={value}
				onChange={(e) => {
					updateTextWidth()
					onChange(e.target.value)
				}}
				className="grow bg-transparent text-center"
				style={{width: `${textWidth}px`}}
			/>

			{typeof window !== `undefined` &&
				ReactDOM.createPortal(
					<p className="fixed left-full whitespace-pre" ref={referenceText}>
						{value}
					</p>,
					document.body,
				)}
		</>
	)
}

export default Object.assign(forwardRef(Draggable), {Input})
