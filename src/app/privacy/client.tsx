"use client"

import {Input} from "antd"
import Image from "next/image"

import type {FC} from "react"

import {privacyPolicy} from "~/components/PrivacyPolicy"

const PrivacyClientPage: FC = () => {
	return (
		<div className="h-full w-full overflow-x-hidden">
			<div className="mx-auto flex h-full max-w-5xl flex-col gap-8 p-8">
				<div className="flex justify-between">
					<Image src="/images/logo-light.svg" alt="SprintZero logo" width={214} height={48} priority />
				</div>
				<div className="flex flex-col gap-8">
					<h1 className="text-3xl">Privacy Policy</h1>
					<Input.TextArea
						size="large"
						readOnly
						rows={20}
						value={privacyPolicy}
						className="!resize-none bg-[#eceef1] font-mono text-sm text-text"
					/>
				</div>
			</div>
		</div>
	)
}

export default PrivacyClientPage
