import type {ReactElement, ReactNode} from "react"

// import "./styles.css"

type Props = {
	children: ReactNode
}

const RootLayout = ({children}: Props): ReactElement | null => {
	return <div>{children}</div>
}

export default RootLayout
