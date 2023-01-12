import {useAnimationFrame} from "framer-motion"
import {useAtomValue} from "jotai"
import {Fragment, useEffect, useState} from "react"

import type {TargetLocation} from "./utils"
import type {FC} from "react"

import {storyMapStateAtom} from "./atoms"
import {calculateBoundaries, boundaries, getTargetLocation, layerBoundaries} from "./utils"

const leftOffset = 248

const DebugVisualizer: FC = () => {
	const [, setRandom] = useState(0)
	const [targetLocation, setTargetLocation] = useState<TargetLocation>({
		epic: undefined,
		feature: undefined,
		story: undefined,
	})
	const storyMapState = useAtomValue(storyMapStateAtom)

	useAnimationFrame(() => {
		calculateBoundaries(storyMapState)
		setRandom(Math.random())
	})

	useEffect(() => {
		const onPointerMove = () => {
			setTargetLocation(getTargetLocation(storyMapState))
		}

		window.addEventListener(`pointermove`, onPointerMove)

		return () => {
			window.removeEventListener(`pointermove`, onPointerMove)
		}
	}, [storyMapState])

	// console.log(targetLocation.epic)
	// const targetEpic = targetLocation.epic !== undefined ? storyMapState.epics[targetLocation.epic]! : undefined
	// const targetEpicBoundaries = targetEpic?.id ? epicBoundaries[targetEpic.epic] : undefined

	return (
		<div className="pointer-events-none absolute inset-0">
			<div className="absolute w-full" style={{height: layerBoundaries[0]}}>
				{boundaries.epicBoundaries.map((boundaries) => (
					<Fragment key={boundaries.id}>
						<div className="absolute h-full w-px bg-black" style={{left: `${boundaries.left - leftOffset}px`}} />
						<div className="absolute h-full w-px bg-black" style={{left: `${boundaries.right - leftOffset}px`}} />
					</Fragment>
				))}
			</div>

			<div
				className="absolute w-full"
				style={{top: layerBoundaries[0], height: layerBoundaries[1] - layerBoundaries[0]}}
			>
				{boundaries.epicBoundaries
					.flatMap((epicBoundaries) => epicBoundaries.featureBoundaries)
					.map((boundaries) => (
						<Fragment key={boundaries.id}>
							<div className="absolute h-full w-px bg-black" style={{left: `${boundaries.left - leftOffset}px`}} />
							<div className="absolute h-full w-px bg-black" style={{left: `${boundaries.right - leftOffset}px`}} />
						</Fragment>
					))}
			</div>

			<div className="absolute w-full" style={{top: layerBoundaries[1]}}>
				{boundaries.epicBoundaries
					.flatMap((epicBoundaries) => epicBoundaries.featureBoundaries)
					.map((boundaries) => (
						<div
							key={boundaries.id}
							className="absolute h-full"
							style={{
								left: `${boundaries.left - leftOffset}px`,
								width: `${boundaries.right - boundaries.left}px`,
							}}
						>
							{boundaries.storyBoundaries.map((boundaries) => (
								<Fragment key={boundaries.id}>
									<div
										className="absolute h-px w-full bg-black"
										style={{top: `${boundaries.top - layerBoundaries[1] - 224}px`}}
									/>
									<div
										className="absolute h-px w-full bg-black"
										style={{top: `${boundaries.bottom - layerBoundaries[1] - 224}px`}}
									/>
								</Fragment>
							))}
						</div>
					))}
			</div>

			{/* {targetEpicBoundaries && (
				<div
					className="rounded border border-green-s800 bg-green-s800/10"
					style={{
						left: `${targetEpicBoundaries.left}px`,
						top: `${layerBoundaries[0]}px`,
						height: `${layerBoundaries[1] - layerBoundaries[0]}px`,
						width: `${targetEpicBoundaries.right - targetEpicBoundaries.left}px`,
					}}
				/>
			)} */}
		</div>
	)
}

export default DebugVisualizer
