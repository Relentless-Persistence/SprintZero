"use client"

import {Card} from "antd"
import Image from "next/image"

import type {FC} from "react"

import PrivacyPolicy from "~/components/PrivacyPolicy"

const PrivacyClientPage: FC = () => {
	return (
		<div className="h-full w-full overflow-x-hidden">
			<div className="mx-auto flex h-full max-w-5xl flex-col gap-8 p-8">
				<div className="flex justify-between">
					<Image src="/images/logo-light.svg" alt="SprintZero logo" width={214} height={48} priority />
				</div>
				<div className="flex flex-col gap-8">
					<h1 className="text-3xl">Privacy Policy</h1>
					<Card className="min-h-0 flex-1 !resize-none overflow-auto border-border bg-fillTertiary font-mono text-text">
						<PrivacyPolicy />
					</Card>
				</div>
			</div>
		</div>
	)
}

export default PrivacyClientPage
