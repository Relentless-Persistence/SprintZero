"use client"

import {Button, Card, Checkbox} from "antd"
import {collectionGroup, doc, getDocs, orderBy, query, updateDoc, where} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useState} from "react"
import {useAuthState} from "react-firebase-hooks/auth"

import type {FC} from "react"

import LinkTo from "~/components/LinkTo"
import NonDiscolsureAgreement from "~/components/NonDisclosureAgreement"
import PrivacyPolicy from "~/components/PrivacyPolicy"
import TermsOfService from "~/components/TermsOfService"
import {MemberConverter} from "~/types/db/Products/Members"
import {UserConverter} from "~/types/db/Users"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {auth, db} from "~/utils/firebase"

const AcceptTermsClientPage: FC = () => {
	const router = useRouter()
	const [agree, setAgree] = useState(false)
	const [user, , userError] = useAuthState(auth)
	conditionalThrow(userError)

	const [hasAccepted, setHasAccepted] = useState(false)
	const onAccept = async () => {
		if (hasAccepted || !user) return
		try {
			setHasAccepted(true)
			await updateDoc(doc(db, `Users`, user.uid).withConverter(UserConverter), {
				hasAcceptedTos: true,
			})

			const {docs: members} = await getDocs(
				query(collectionGroup(db, `Members`), where(`id`, `==`, user.uid), orderBy(`name`, `asc`)).withConverter(
					MemberConverter,
				),
			)
			if (members.length === 0) router.push(`/product`)
			else router.push(`/${members[0]!.ref.parent.parent!.id}/map`)
		} catch (e) {
			setHasAccepted(false)
			throw e
		}
	}

	return (
		<div className="flex h-full flex-col gap-6">
			<div className="leading-normal">
				<h1 className="text-3xl font-semibold">Let&apos;s Get Started!</h1>
				<p className="text-xl text-textSecondary">
					To create an account, please agree to below{` `}
					<LinkTo href="https://www.sprintzero.app/terms" className="font-medium text-info">
						Terms of Service
					</LinkTo>
					,{` `}
					<LinkTo href="https://www.sprintzero.app/privacy" className="font-medium text-info">
						Privacy Policy
					</LinkTo>
					{` `}& Non-Disclosure Agreement
				</p>
			</div>

			<div className="flex grow flex-col gap-4">
				<Card className="min-h-0 flex-1 !resize-none overflow-auto border-border bg-fillTertiary font-mono text-text">
					<TermsOfService />
					<br />
					<PrivacyPolicy />
					<br />
					<NonDiscolsureAgreement />
				</Card>

				<Checkbox checked={agree} onChange={() => setAgree((agree) => !agree)}>
					By checking this box you agree to our Terms of Service and Privacy Policy.
				</Checkbox>
			</div>

			<div className="flex items-center justify-end gap-4">
				<Button className="bg-white" onClick={() => router.push(`/sign-out`)}>
					Cancel
				</Button>
				<Button
					type="primary"
					disabled={!agree}
					loading={hasAccepted}
					onClick={() => {
						onAccept().catch(console.error)
					}}
				>
					Continue
				</Button>
			</div>
		</div>
	)
}

export default AcceptTermsClientPage
