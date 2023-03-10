"use client"

import {Button, Card, Checkbox} from "antd"
import {collection, doc, getDocs, query, updateDoc, where} from "firebase/firestore"
import {useRouter} from "next/navigation"
import {useState} from "react"

import type {FC} from "react"
import type {User} from "~/types/db/Users"

import {useAppContext} from "../../AppContext"
import LinkTo from "~/components/LinkTo"
import NonDiscolsureAgreement from "~/components/NonDisclosureAgreement"
import PrivacyPolicy from "~/components/PrivacyPolicy"
import TermsOfService from "~/components/TermsOfService"
import {ProductConverter} from "~/types/db/Products"
import {db} from "~/utils/firebase"

const AcceptTermsClientPage: FC = () => {
	const router = useRouter()
	const [agree, setAgree] = useState(false)
	const {user} = useAppContext()

	const [hasAccepted, setHasAccepted] = useState(false)
	const onAccept = async () => {
		if (hasAccepted) return
		try {
			setHasAccepted(true)
			await updateDoc(doc(db, `Users`, user.id), {
				hasAcceptedTos: true,
			} satisfies Partial<User>)

			const {docs: products} = await getDocs(
				query(collection(db, `Products`), where(`members.${user.id}.type`, `==`, `editor`)).withConverter(
					ProductConverter,
				),
			)
			if (products.length === 0) router.push(`/product`)
			else router.push(`/${products[0]!.id}/map`)
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
