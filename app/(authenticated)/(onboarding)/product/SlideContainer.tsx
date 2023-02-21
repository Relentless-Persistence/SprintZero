import clsx from "clsx"

import type {FC, ReactNode} from "react"

export type SlideContainerProps = {
	children: ReactNode
	isActive: boolean
}

const SlideContainer: FC<SlideContainerProps> = ({children, isActive}) => {
	return (
		<div
			className={clsx(`h-full w-96 transition-[opacity,transform] duration-300`, !isActive && `scale-95 opacity-50`)}
		>
			{children}
		</div>
	)
}

export default SlideContainer
