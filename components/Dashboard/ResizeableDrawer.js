import React, {useState, useEffect, useCallback} from "react"
import {Drawer} from "antd"

const DEFAULT_HEIGHT = 378

const ResizeableDrawer = ({children, visible, ...props}) => {
	const [height, setHeight] = useState(DEFAULT_HEIGHT)

	const handler = useCallback(() => {
		setHeight(window.innerHeight)
	}, [])

	useEffect(() => {
		if (!visible) {
			setHeight(DEFAULT_HEIGHT)
		}
	}, [visible])

	return (
		<Drawer height={height} visible={visible} {...props}>
			<button className="absolute top-[4px] left-1/2 block -translate-x-2/4 py-[4px]" onMouseDown={handler}>
				<div className="h-[2px] w-[70px] bg-[#A6AE9D]"></div>
			</button>
			{children}
		</Drawer>
	)
}

export default ResizeableDrawer
