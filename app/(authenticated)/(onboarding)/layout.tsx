"use client"

import {Avatar} from "antd"
import Image from "next/image"
import {useAuthState} from "react-firebase-hooks/auth"
import invariant from "tiny-invariant"

import type {FC, ReactNode} from "react"

import {auth} from "~/utils/firebase"

export type OnboardingLayoutProps = {
	children: ReactNode
}

const OnboardingLayout: FC<OnboardingLayoutProps> = ({children}) => {
	const [user] = useAuthState(auth)
	invariant(user, `User must be logged in`)

	return (
		<div className="h-full w-full overflow-x-hidden">
			<div className="mx-auto flex h-full max-w-5xl flex-col gap-8 p-8">
				<div className="flex justify-between">
					<Image src="/images/logo_beta_light.png" alt="SprintZero logo" width={178} height={42} priority />
					<div className="flex items-center gap-2">
						<Avatar src={user.photoURL} size="large" alt="Avatar" className="border border-black" />
						<div className="flex w-min flex-col gap-1">
							<p className="font-semibold">{user.displayName}</p>
							<p className="text-ellipsis text-[#595959]">{user.email}</p>
						</div>
					</div>
				</div>
				{children}
			</div>
		</div>
	)
}

export default OnboardingLayout
