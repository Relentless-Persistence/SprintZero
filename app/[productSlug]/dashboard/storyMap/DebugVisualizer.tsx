import {useAnimationFrame} from "framer-motion"
import {useAtomValue} from "jotai"
import {Fragment, useEffect, useState} from "react"

import type {FC} from "react"

import {storyMapStateAtom} from "./atoms"
import {storyMapTop, calculateBoundaries, boundaries, getTargetLocation, layerBoundaries} from "./utils"

const storyMapLeft = 248

const DebugVisualizer: FC = () => {
	const [, setRandom] = useState(0)
	const storyMapState = useAtomValue(storyMapStateAtom)

	useAnimationFrame(() => {
		calculateBoundaries(storyMapState)
		setRandom(Math.random())
	})

	useEffect(() => {
		const onPointerMove = () => {
			const targetLocation = getTargetLocation(storyMapState, {epic: 0, feature: 0})
			console.info(targetLocation)
		}

		window.addEventListener(`pointermove`, onPointerMove)

		return () => {
			window.removeEventListener(`pointermove`, onPointerMove)
		}
	}, [storyMapState])

	return (
		<div className="pointer-events-none absolute inset-0 opacity-60">
			<div className="absolute w-full" style={{height: layerBoundaries[0] - storyMapTop}}>
				{boundaries.epicBoundaries.map((boundaries) => (
					<Fragment key={boundaries.id}>
						<div className="absolute h-full w-0.5 bg-[#9adbdf]" style={{left: `${boundaries.left - storyMapLeft}px`}} />
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
								style={{left: `${boundaries.left - storyMapLeft}px`}}
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
	)
}

export default DebugVisualizer
