"use client"

import {Button, Checkbox, Input} from "antd"
import {doc, updateDoc} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useState} from "react"

import type {FC} from "react"
import type {User} from "~/types/db/Users"

import {termsOfService} from "~/components/terms"
import {Users} from "~/types/db/Users"
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
		await updateDoc(doc(db, Users._, user!.id), {
			hasAcceptedTos: true,
		} satisfies Partial<User>)
		router.push(`/product`)
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl">Let&apos;s Get Started!</h1>
				<p className="text-xl text-gray">
					Thanks for choosing SprintZero to build your next product experience! Start by reviewing and accepting our
					terms of service.
				</p>
			</div>

			<Input.TextArea
				size="large"
				readOnly
				rows={15}
				value={termsOfService}
				className="resize-none bg-[#eceef1] font-mono text-sm text-black"
			/>

			<Checkbox checked={agree} onChange={() => void setAgree((agree) => !agree)}>
				By checking this box you agree to our Terms of Service and Privacy Policy.
			</Checkbox>

			<div className="flex items-center justify-end gap-4">
				<Button className="bg-white" onClick={() => void router.push(`/sign-out`)}>
					Reject
				</Button>
				<Button type="primary" disabled={!agree} loading={hasAccepted} onClick={onAccept} className="bg-[#4a801d]">
					Accept
				</Button>
			</div>
		</div>
	)
}

export default TosPage
