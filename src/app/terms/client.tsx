"use client"

import {Input} from "antd"
import Image from "next/image"

import type {FC} from "react"

import {termsOfService} from "~/components/TermsOfService"

const TermsClientPage: FC = () => {
	return (
		<div className="h-full w-full overflow-x-hidden">
			<div className="mx-auto flex h-full max-w-5xl flex-col gap-8 p-8">
				<div className="flex justify-between">
					<Image src="/images/logo-light.svg" alt="SprintZero logo" width={214} height={48} priority />
				</div>
				<div className="flex flex-col gap-8">
					<h1 className="text-3xl">Terms of Service</h1>
					<Input.TextArea
						size="large"
						readOnly
						rows={20}
						value={termsOfService}
						className="!resize-none bg-[#eceef1] font-mono text-sm text-text"
					/>
				</div>
			</div>
		</div>
	)
}

export default TermsClientPage
