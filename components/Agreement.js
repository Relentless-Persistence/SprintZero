import {Button, Checkbox, Space} from "antd"
import TextArea from "antd/lib/input/TextArea"
import React, {useState} from "react"
import {termsOfAgreement} from "../fakeData/terms"
import {db} from "../config/firebase-config"
import {useAuth} from "../contexts/AuthContext"
import {useRouter} from "next/router"
import {notification} from "antd5"
import {auth} from "../config/firebase-config"

const Agreement = () => {
	const router = useRouter()
	const {user} = useAuth()
	const [terms, setTerms] = useState(termsOfAgreement)
	const [agree, setAgree] = useState(false)

	const onNext = (e) => {
		if (agree === false) {
			notification.error({message: "You have to agree to the Terms and Conditions!"})
		} else {
			const data = {
				user_id: user.uid,
				agreed: agree,
			}

			db.collection("Agreement")
				.add(data)
				.then(() => {
					router.push("/product")
				})
		}
	}

	const onCancel = (e) => {
    auth.signOut();
		router.push("/")
	}

	return (
		<div>
			<h1 className="text-[38px]">Let’s Get Started!</h1>
			<p className="mb-8 text-xl">
				Thanks for choosing SprintZero to build your next product experience! Start by reviewing and accepting our terms
				of service.{" "}
			</p>

			<TextArea placeholder="Legal Copy" size="Large" value={terms} readOnly rows={10} className="mb-4"></TextArea>

			<Checkbox checked={agree} onChange={(e) => setAgree(!agree)}>
				By checking this box you affrim etc
			</Checkbox>

			<div className="flex items-center justify-end">
				<Space>
					<Button className="bg-white hover:text-[#40A9FF]" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						className="bg-[#4A801D] text-white outline-none hover:bg-[#5A9D24] hover:text-white hover:outline-none focus:bg-[#5A9D24] focus:outline-none"
						onClick={onNext}
					>
						Next
					</Button>
				</Space>
			</div>
		</div>
	)
}

export default Agreement
