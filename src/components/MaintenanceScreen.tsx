import Image from "next/image"

import type {FC} from "react"

const MaintenancePage: FC = () => {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-6">
			<Image src="/images/logo-light.svg" alt="SprintZero logo" width={214} height={48} />
			<p className="text-center text-lg font-medium leading-normal">
				Sorry, the app is currently undergoing maintenance.
				<br />
				Be back in a bit!
			</p>
		</div>
	)
}

export default MaintenancePage
