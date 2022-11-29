import {motion} from "framer-motion"
import {forwardRef, useEffect, useRef, useState} from "react"
import ReactDOM from "react-dom"
import {usePreviousDistinct} from "react-use"

import type {ReactNode, FC, ForwardRefRenderFunction} from "react"
import type {Id} from "~/types"

import {useStoryMapStore} from "./storyMapStore"

export type DraggableProps = {
	children: ReactNode
	layer: number
	id: Id
}

const Draggable: ForwardRefRenderFunction<HTMLDivElement, DraggableProps> = ({children, layer, id}, ref) => {
	const [isHovering, setIsHovering] = useState(false)
	const [isHolding, setIsHolding] = useState(false)
	const isActive = isHovering || isHolding

	const setCurrentLayerHover = useStoryMapStore((state) => state.setCurrentLayerHover)

	const prevIsActive = usePreviousDistinct(isActive)
	useEffect(() => {
		if (isActive && !prevIsActive) setCurrentLayerHover(layer, id)
		if (!isActive && prevIsActive) setCurrentLayerHover(layer, null)
	}, [id, isActive, layer, prevIsActive, setCurrentLayerHover])

	return (
		<motion.div drag dragSnapToOrigin data-layer={layer} ref={ref}>
			<div
				onPointerMove={(e) => {
					const isDraggable = !(e.target as HTMLElement).hasAttribute(`data-nondraggable`)
					setIsHovering(isDraggable)
					if (!isDraggable) e.stopPropagation()
				}}
				onPointerLeave={() => void setIsHovering(false)}
				onPointerDown={(e) => {
					const isDraggable = !(e.target as HTMLElement).hasAttribute(`data-nondraggable`)
					setIsHolding(isDraggable)
					if (!isDraggable) e.stopPropagation()
				}}
				onPointerUp={() => void setIsHolding(false)}
				onPointerCancel={() => void setIsHolding(false)}
			>
				{children}
			</div>
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
				ref={() => void updateTextWidth()}
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

export const useIsHovering = (layer: number, id: Id) => {
	const currentlyHovering = useStoryMapStore((state) => state.currentlyHovering)
	return currentlyHovering[layer] === id && !currentlyHovering[layer + 1]
}
