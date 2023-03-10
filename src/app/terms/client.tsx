"use client"

import {Card} from "antd"
import Image from "next/image"

import type {FC} from "react"

import TermsOfService from "~/components/TermsOfService"

const TermsClientPage: FC = () => {
	return (
		<div className="h-full w-full overflow-x-hidden">
			<div className="mx-auto flex h-full max-w-5xl flex-col gap-8 p-8">
				<div className="flex justify-between">
					<Image src="/images/logo-light.svg" alt="SprintZero logo" width={214} height={48} priority />
				</div>
				<div className="flex flex-col gap-8">
					<h1 className="text-3xl">Terms of Service</h1>
					<Card className="min-h-0 flex-1 !resize-none overflow-auto border-border bg-fillTertiary font-mono text-text">
						<TermsOfService />
					</Card>
				</div>
			</div>
		</div>
	)
}

export default TermsClientPage
