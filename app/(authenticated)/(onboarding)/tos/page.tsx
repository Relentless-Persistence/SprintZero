"use client"

import {Button, Checkbox, Input} from "antd"
import {doc, updateDoc} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useState} from "react"

import type {FC} from "react"
import type {User} from "~/types/db/Users"

import LinkTo from "~/components/LinkTo"
import {termsOfService} from "~/components/terms"
import {db} from "~/utils/firebase"
import {useUser} from "~/utils/useUser"

const TosPage: FC = () => {
	const router = useRouter()
	const [agree, setAgree] = useState(false)
	const user = useUser()

	const [hasAccepted, setHasAccepted] = useState(false)
	const onAccept = async () => {
		if (hasAccepted) return
		setHasAccepted(true)
		await updateDoc(doc(db, `Users`, user!.id), {
			hasAcceptedTos: true,
		} satisfies Partial<User>)
		router.push(`/product`)
	}

	return (
		<div className="flex h-full flex-col gap-8">
			<div>
				<h1 className="text-3xl font-semibold">Let&apos;s Get Started!</h1>
				<p className="text-lg text-gray">
					To create an account, please agree to below{` `}
					<LinkTo href="https://www.sprintzero.app/terms" className="font-medium text-blue">
						Terms of Service
					</LinkTo>
					{` `}
					and{` `}
					<LinkTo href="https://www.sprintzero.app/privacy" className="font-medium text-blue">
						Privacy Policy
					</LinkTo>
					:
				</p>
			</div>

			<div className="flex grow flex-col gap-4">
				<Input.TextArea
					size="large"
					readOnly
					rows={15}
					value={termsOfService}
					className="grow !resize-none bg-[#eceef1] font-mono text-sm text-black"
				/>

				<Checkbox checked={agree} onChange={() => setAgree((agree) => !agree)}>
					By checking this box you agree to our Terms of Service and Privacy Policy.
				</Checkbox>
			</div>

			<div className="flex items-center justify-end gap-4">
				<Button className="bg-white" onClick={() => router.push(`/sign-out`)}>
					Reject
				</Button>
				<Button
					type="primary"
					disabled={!agree}
					loading={hasAccepted}
					onClick={() => {
						onAccept().catch(console.error)
					}}
					className="bg-[#4a801d]"
				>
					Accept
				</Button>
			</div>
		</div>
	)
}

export default TosPage
