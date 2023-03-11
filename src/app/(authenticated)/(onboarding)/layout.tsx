"use client"

import {Avatar} from "antd"
import Image from "next/image"
import {useAuthState} from "react-firebase-hooks/auth"

import type {FC, ReactNode} from "react"

import LinkTo from "~/components/LinkTo"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {auth} from "~/utils/firebase"

export type OnboardingLayoutProps = {
	children: ReactNode
}

const OnboardingLayout: FC<OnboardingLayoutProps> = ({children}) => {
	const [user, , userError] = useAuthState(auth)
	conditionalThrow(userError)

	if (!user) return null
	return (
		<div className="h-full w-full overflow-x-hidden">
			<div className="mx-auto flex h-full max-w-5xl flex-col gap-6 p-8">
				<div className="flex items-center justify-between gap-4">
					<Image src="/images/logo-light.svg" alt="SprintZero logo" width={214} height={48} priority />
					<div className="flex min-w-0 flex-1 flex-col items-end gap-1">
						<div className="flex w-full flex-1 items-center gap-3">
							<div className="min-w-0 flex-1 text-end leading-normal">
								<p>{user.displayName}</p>
								<p className="truncate text-sm text-textTertiary">{user.email}</p>
							</div>
							<Avatar
								src={user.photoURL}
								size={48}
								alt="Avatar"
								className="shrink-0 basis-auto border border-primary"
							/>
						</div>
						<LinkTo href="/sign-out" className="text-sm text-info">
							Sign out
						</LinkTo>
					</div>
				</div>
				<div className="grow">{children}</div>
			</div>
		</div>
	)
}

export default OnboardingLayout
