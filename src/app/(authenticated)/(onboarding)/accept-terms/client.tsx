"use client"

import { Avatar, Button, Card, Checkbox } from "antd"
import { collectionGroup, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useAuthState } from "react-firebase-hooks/auth"

import type { FC } from "react"

import LinkTo from "~/components/LinkTo"
import NonDiscolsureAgreement from "~/components/NonDisclosureAgreement"
import PrivacyPolicy from "~/components/PrivacyPolicy"
import TermsOfService from "~/components/TermsOfService"
import { MemberConverter } from "~/types/db/Products/Members"
import { UserConverter } from "~/types/db/Users"
import { auth, db } from "~/utils/firebase"

const AcceptTermsClientPage: FC = () => {
	const router = useRouter()
	const [agree, setAgree] = useState(false)
	const [user, , userError] = useAuthState(auth)
	useErrorHandler(userError)


	const [hasAccepted, setHasAccepted] = useState(false)
	const onAccept = async () => {
		if (hasAccepted || !user) return
		try {
			setHasAccepted(true)
			await updateDoc(doc(db, `Users`, user.uid).withConverter(UserConverter), {
				hasAcceptedTos: true,
			})

			const { docs: members } = await getDocs(
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
			<div className="flex">

				<div className="leading-normal">
					<h1 className="text-5xl font-semibold">Ugh...lawyers and their legalese, amirite?</h1>
					<p className="text-lg text-textSecondary">
						Before we can proceed please agree to our Terms of Service & Privacy Policy{` `}
						<LinkTo href="https://www.sprintzero.app/terms" className="font-medium text-info">
							Terms of Service
						</LinkTo>
						,{` `}
						<LinkTo href="https://www.sprintzero.app/privacy" className="font-medium text-info">
							Privacy Policy
						</LinkTo>
					</p>
				</div>

				<div className="flex items-center flex-end gap-4">
					<div className="flex min-w-0 flex-1 flex-col items-end gap-1">
						<div className="flex w-full flex-1 items-center gap-3">
							<div className="min-w-0 flex-1 text-end leading-normal">
								<p className="font-semibold">{user.displayName}</p>
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
							Log out
						</LinkTo>
					</div>
				</div>

			</div>

			<div className="flex grow flex-col items-start gap-4">
				<Card className="min-h-0 flex-1 !resize-none overflow-auto border-border bg-fillTertiary font-mono text-text">
					<TermsOfService />
					<br />
					<PrivacyPolicy />
					<br />
					<NonDiscolsureAgreement />
				</Card>

				<Checkbox checked={agree} onChange={() => setAgree((agree) => !agree)}>
					<p className="font-semibold">By checking this box you agree to our Terms of Service, Privacy Policy, and Non-Disclosure Agreement.</p>
				</Checkbox>
			</div>

			<div className="flex justify-between gap-4">
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
					Agree
				</Button>
			</div>
		</div>
	)
}

export default AcceptTermsClientPage
