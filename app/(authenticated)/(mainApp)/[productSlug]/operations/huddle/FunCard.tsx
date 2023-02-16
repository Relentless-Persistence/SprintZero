import { Card } from "antd"

import type { FC } from "react"

const FunCard: FC = () => {
  return (
		<Card size="small" title="Small size card">
			<p>Card content</p>
			<p>Card content</p>
			<p>Card content</p>
		</Card>
	)
}

export default FunCard