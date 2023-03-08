import type {FC} from "react"

const PrivacyPolicy: FC = () => {
	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-xl font-bold">Privacy Policy</h2>

			<h3 className="font-bold">Introduction</h3>
			<p>
				This privacy policy statement outlines the types of personal information we collect, the reasons for which we
				collect it, and how we handle, store and protect that information. We are committed to safeguarding the privacy
				of all of our users and customers.
			</p>

			<h3 className="font-bold">Information Collection</h3>
			<p>We may collect the following types of information from our users:</p>
			<ul className="list-disc pl-4">
				<li>
					Personal Information: This includes your name, email address, and other contact details that you may provide
					when registering for an account, making a purchase, or communicating with our support team.
				</li>
				<li>
					Usage Information: We may collect information about your use of our web application, such as pages visited,
					frequency of use, and other usage patterns.
				</li>
				<li>
					Payment Information: If you make a purchase through our web application, we may collect payment information,
					such as your credit card details or other payment information.
				</li>
			</ul>

			<h3 className="font-bold">Use of Information</h3>
			<p>We may use the information we collect from you to:</p>
			<ul className="list-disc pl-4">
				<li>Provide and improve our web application services</li>
				<li>Communicate with you regarding your account and purchases</li>
				<li>Personalize your experience on our web application</li>
				<li>Send promotional materials, such as updates on new features or special offers</li>
				<li>Data Retention</li>
			</ul>
			<p>
				We will retain your personal information only for as long as is necessary to fulfill the purposes outlined in
				this privacy policy statement. After this time, your information will be deleted from our systems.
			</p>

			<h3 className="font-bold">Data Security</h3>
			<p>
				We take data security very seriously and have implemented appropriate technical and organizational measures to
				protect your personal information from unauthorized access, disclosure, alteration or destruction.
			</p>

			<h3 className="font-bold">Changes to this Privacy Policy Statement</h3>
			<p>
				We reserve the right to modify this privacy policy statement at any time. If we make any changes, we will post
				the updated privacy policy statement on this page. Your continued use of our web application after any changes
				are made constitutes your acceptance of the revised privacy policy statement.
			</p>

			<h3 className="font-bold">Contact Us</h3>
			<p>
				If you have any questions or concerns regarding our privacy policy statement, please contact us by email at
				support@sprintzero.app.
			</p>
		</div>
	)
}

export default PrivacyPolicy
