"use client"

import {motion} from "framer-motion"
import {forwardRef, useLayoutEffect} from "react"

import type {ReactNode, FC, ForwardRefRenderFunction} from "react"
import type {Id} from "~/types"

import {useStoryMapStore} from "./storyMapStore"

export type DraggableProps = {
	children: ReactNode
	layer: number
	id: Id
}

const Draggable: ForwardRefRenderFunction<HTMLDivElement, DraggableProps> = ({children, layer, id}, ref) => {
	return (
		<motion.div drag dragSnapToOrigin data-layer={layer} ref={ref}>
			<div>{children}</div>
		</motion.div>
	)
}

export type InputProps = {
	value: string
	onChange: (value: string) => void
}

const Input: FC<InputProps> = ({value, onChange}) => {
	const calculateDividers = useStoryMapStore((state) => state.calculateDividers)
	useLayoutEffect(() => {
		calculateDividers()
	}, [calculateDividers, value])

	return (
		<div className="w-max">
			<input
				data-nondraggable
				value={value}
				onChange={(e) => void onChange(e.target.value)}
				className="w-full grow bg-transparent text-center leading-none"
				size={1}
			/>
			<p className="h-0 overflow-hidden whitespace-pre text-sm opacity-0">{value}</p>
		</div>
	)
}

export default Object.assign(forwardRef(Draggable), {Input: Input})
