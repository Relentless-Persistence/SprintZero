"use client"

import { Avatar } from "antd"
import Image from "next/image"
import { useErrorHandler } from "react-error-boundary"
import { useAuthState } from "react-firebase-hooks/auth"

import type { FC, ReactNode } from "react"

import LinkTo from "~/components/LinkTo"
import { auth } from "~/utils/firebase"

export type OnboardingLayoutProps = {
	children: ReactNode
}

const OnboardingLayout: FC<OnboardingLayoutProps> = ({ children }) => {
	const [user, , userError] = useAuthState(auth)
	useErrorHandler(userError)

	if (!user) return null
	return (
		<div className="h-screen flex flex-col">
			<div className="flex justify-center mt-6">
				<Image src="/images/logo-light.svg" alt="SprintZero logo" width={160} height={35} priority />
				{/* <Image src="/images/logo-light.svg" alt="SprintZero logo" width={214} height={48} priority /> */}
			</div>
			<div className="mx-auto flex h-full w-8/12 flex-col gap-6 p-8">
				<div className="grow">{children}</div>
			</div>
		</div>
	)
}

export default OnboardingLayout
