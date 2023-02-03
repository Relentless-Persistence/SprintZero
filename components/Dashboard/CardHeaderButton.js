import React from "react"
import styled from "styled-components"
import {Button} from "antd"

// background:transparent;
const More = styled(Button)`
	color: #fff !important;
	background: #4a801d;
	box-shadow: none !important;
`

const Link = styled(Button)`
	color: #4a801d !important;
	box-shadow: none !important;
	border: none;
	background: transparent !important;
`

const CardHeaderLink = ({children, ...props}) => {
	return (
		<Link type="link" size="small" {...props}>
			{children}
		</Link>
	)
}

const CardHeaderButton = ({children, ...props}) => {
	return (
		<More size="small" {...props}>
			{children}
		</More>
	)
}

export {CardHeaderLink}

export default CardHeaderButton
