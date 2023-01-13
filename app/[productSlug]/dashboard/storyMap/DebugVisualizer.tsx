import {useAnimationFrame} from "framer-motion"
import {useAtomValue} from "jotai"
import {Fragment, useEffect, useState} from "react"

import type {StoryMapLocation} from "./utils/types"
import type {FC} from "react"

import {storyMapStateAtom} from "./atoms"
import {calculateBoundaries} from "./utils"
import {boundaries, layerBoundaries, pointerLocation, storyMapTop} from "./utils/globals"
import {getHoveringLocation, getTargetLocation} from "./utils/targeting"

const storyMapLeft = 248

export type DebugVisualizerProps = {
	showBoundaryLines: boolean
	logTargetLocation: StoryMapLocation | boolean
}

const DebugVisualizer: FC<DebugVisualizerProps> = ({showBoundaryLines, logTargetLocation}) => {
	const [, setRandom] = useState(0)
	const storyMapState = useAtomValue(storyMapStateAtom)

	useAnimationFrame(() => {
		calculateBoundaries(storyMapState)
		setRandom(Math.random())
	})

	useEffect(() => {
		const onPointerMove = () => {
			if (!logTargetLocation) return

			const targetLocation =
				logTargetLocation === true ? getHoveringLocation() : getTargetLocation(storyMapState, logTargetLocation)
			console.info(targetLocation)
		}

		window.addEventListener(`pointermove`, onPointerMove)

		return () => {
			window.removeEventListener(`pointermove`, onPointerMove)
		}
	}, [logTargetLocation, storyMapState])

	return (
		<div className="pointer-events-none absolute inset-0">
			<p className="fixed bottom-2 right-20 font-[monospace] text-sm">
				{Math.round(pointerLocation.current[0])}, {Math.round(pointerLocation.current[1])}
			</p>
			{showBoundaryLines && (
				<div className="opacity-60">
					<div className="absolute w-full" style={{height: layerBoundaries[0] - storyMapTop}}>
						{boundaries.epicBoundaries.map((boundaries) => (
							<Fragment key={boundaries.id}>
								<div
									className="absolute h-full w-0.5 bg-[#9adbdf]"
									style={{left: `${Math.max(boundaries.left - storyMapLeft, -10000)}px`}}
								/>
								{boundaries.centerWithLeft && (
									<div
										className="absolute h-full w-0.5 bg-[#148bf2]"
										style={{left: `${boundaries.centerWithLeft - storyMapLeft}px`}}
									/>
								)}
								<div
									className="absolute h-full w-0.5 bg-[#0446e5]"
									style={{left: `${boundaries.center - storyMapLeft}px`}}
								/>
								{boundaries.centerWithRight && (
									<div
										className="absolute h-full w-0.5 bg-[#148bf2]"
										style={{left: `${boundaries.centerWithRight - storyMapLeft}px`}}
									/>
								)}
								<div
									className="bg-bg-[#9adbdf] absolute h-full w-0.5"
									style={{left: `${boundaries.right - storyMapLeft}px`}}
								/>
							</Fragment>
						))}
					</div>

					<div
						className="absolute w-full"
						style={{top: layerBoundaries[0] - storyMapTop, height: layerBoundaries[1] - layerBoundaries[0]}}
					>
						{boundaries.epicBoundaries
							.flatMap((epicBoundaries) => epicBoundaries.featureBoundaries)
							.map((boundaries) => (
								<Fragment key={boundaries.id}>
									<div
										className="absolute h-full w-0.5 bg-[#9adbdf]"
										style={{left: `${Math.max(boundaries.left - storyMapLeft, -10000)}px`}}
									/>
									{boundaries.centerWithLeft && (
										<div
											className="absolute h-full w-0.5 bg-[#148bf2]"
											style={{left: `${boundaries.centerWithLeft - storyMapLeft}px`}}
										/>
									)}
									<div
										className="absolute h-full w-0.5 bg-[#0446e5]"
										style={{left: `${boundaries.center - storyMapLeft}px`}}
									/>
									{boundaries.centerWithRight && (
										<div
											className="absolute h-full w-0.5 bg-[#148bf2]"
											style={{left: `${boundaries.centerWithRight - storyMapLeft}px`}}
										/>
									)}
									<div
										className="absolute h-full w-0.5 bg-[#9adbdf]"
										style={{left: `${boundaries.right - storyMapLeft}px`}}
									/>
								</Fragment>
							))}
					</div>

					<div className="absolute w-full" style={{top: layerBoundaries[1] - storyMapTop}}>
						{boundaries.epicBoundaries
							.flatMap((epicBoundaries) => epicBoundaries.featureBoundaries)
							.map((boundaries) => (
								<div
									key={boundaries.id}
									className="absolute"
									style={{
										left: `${Math.max(boundaries.left, 0) - storyMapLeft}px`,
										width: `${Math.min(boundaries.right, 10000) - Math.max(boundaries.left, 0)}px`,
									}}
								>
									{boundaries.storyBoundaries.map((boundaries) => (
										<Fragment key={boundaries.id}>
											<div
												className="absolute h-0.5 w-full bg-[#9adbdf]"
												style={{top: `${boundaries.top - layerBoundaries[1]}px`}}
											/>
											<div
												className="absolute h-0.5 w-full bg-[#0446e5]"
												style={{top: `${boundaries.center - layerBoundaries[1]}px`}}
											/>
											<div
												className="absolute h-0.5 w-full bg-[#9adbdf]"
												style={{top: `${boundaries.bottom - layerBoundaries[1]}px`}}
											/>
										</Fragment>
									))}
								</div>
							))}
					</div>
				</div>
			)}
		</div>
	)
}

export default DebugVisualizer
