import clsx from "clsx"

import type {FC, ReactNode} from "react"

export type SlideContainerProps = {
	children: ReactNode
	currentSlide: number
	slideNumber: number
}

const SlideContainer: FC<SlideContainerProps> = ({children, currentSlide, slideNumber}) => {
	return (
		<div
			className={clsx(
				`h-full w-96 rounded-lg border-2 border-green p-8 transition-opacity`,
				currentSlide !== slideNumber && `opacity-50`,
			)}
		>
			{children}
		</div>
	)
}

export default SlideContainer
