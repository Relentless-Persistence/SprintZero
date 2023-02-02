"use client"

import {Button, Checkbox, Input} from "antd"
import {doc, updateDoc} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"
import invariant from "tiny-invariant"

import type {FC} from "react"
import type {User} from "~/types/db/Users"

import {termsOfAgreement} from "./terms"
import {Users} from "~/types/db/Users"
import {auth, db} from "~/utils/firebase"

const TosPage: FC = () => {
	const router = useRouter()
	const [agree, setAgree] = useState(false)
	const [user] = useAuthState(auth)
	invariant(user, `User must be logged in`)

	const [hasAccepted, setHasAccepted] = useState(false)
	const onAccept = async () => {
		if (hasAccepted) return
		setHasAccepted(true)
		await updateDoc(doc(db, Users._, user.uid), {
			hasAcceptedTos: true,
		} satisfies Partial<User>)
		router.push(`/product`)
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl">Let&apos;s Get Started!</h1>
				<p className="text-xl text-[#595959]">
					Thanks for choosing SprintZero to build your next product experience! Start by reviewing and accepting our
					terms of service.
				</p>
			</div>

			<Input.TextArea
				size="large"
				readOnly
				rows={15}
				value={termsOfAgreement}
				className="resize-none bg-[#eceef1] font-mono text-sm text-black"
			/>

			<Checkbox checked={agree} onChange={() => void setAgree((agree) => !agree)}>
				By checking this box you agree to our Terms of Service and Privacy Policy.
			</Checkbox>

			<div className="flex items-center justify-end gap-4">
				<Button className="bg-white" onClick={() => void router.push(`/sign-out`)}>
					Reject
				</Button>
				<Button type="primary" disabled={!agree} loading={hasAccepted} onClick={onAccept} className="bg-[#4A801D]">
					Accept
				</Button>
			</div>
		</div>
	)
}

export default TosPage
