import type {FC} from "react"

const TermsOfService: FC = () => {
	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-lg font-bold">Terms of Service</h2>

			<p>
				SprintZero (&quot;Software&quot;) is a software product owned and operated by Relentless Persistence Inc.
				(&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These terms and conditions (&quot;Terms&quot;) govern your
				access to and use of the Software. By accessing or using the Software, you agree to be bound by these Terms. If
				you do not agree to these Terms, you may not access or use the Software.
			</p>

			<h3 className="font-bold">License</h3>
			<p>
				Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable
				license to access and use the Software for your personal or internal business use. You may not use the Software
				for any other purpose, or allow any third party to access or use the Software, without our prior written
				consent.
			</p>

			<h3 className="font-bold">Use Restrictions</h3>
			<p>You may not (and may not allow any third party to):</p>
			<ul className="list-disc pl-4">
				<li>
					Modify, adapt, or hack the Software or otherwise attempt to gain unauthorized access to the Software or its
					related systems or networks.
				</li>
				<li>Use the Software to send spam or otherwise duplicative or unsolicited messages.</li>
				<li>Use the Software to store or transmit any malicious code, including viruses, worms, or Trojan horses.</li>
				<li>
					Use the Software to store or transmit any personal data or sensitive information without complying with all
					applicable laws and regulations, including any applicable data protection laws.
				</li>
				<li>
					Use the Software in any way that could interfere with, disrupt, or negatively affect the Software or the
					servers or networks that host the Software.
				</li>
			</ul>

			<h3 className="font-bold">Intellectual Property</h3>
			<p>
				The Software and all content and materials included on or within the Software, including but not limited to
				text, graphics, logos, images, and software, are the property of us or our licensors and are protected by
				copyright and other intellectual property laws. You may not use any content or materials on the Software for any
				commercial purpose without our prior written consent.
			</p>

			<h3 className="font-bold">Disclaimer of Warranties</h3>
			<p>
				The Software is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not warrant that the
				Software will be uninterrupted or error-free, and we will not be liable for any interruptions or errors. We also
				make no representations or warranties of any kind, express or implied, about the completeness, accuracy,
				reliability, suitability, or availability of the Software or the information, products, services, or related
				graphics contained on the Software for any purpose. Any reliance you place on such information is therefore
				strictly at your own risk.
			</p>

			<h3 className="font-bold">Limitation of Liability</h3>
			<p>
				In no event will we be liable for any loss or damage including without limitation, indirect or consequential
				loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in
				connection with, the use of the Software.
			</p>

			<h3 className="font-bold">Governing Law</h3>
			<p>
				These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], and any disputes
				arising in relation to these Terms shall be subject to the exclusive jurisdiction of the courts of
				[Jurisdiction].
			</p>

			<h3 className="font-bold">Changes to These Terms</h3>
			<p>
				We reserve the right to update and revise these Terms from time to time. Any changes will be effective
				immediately upon posting the revised Terms on the Software. Your continued use of the Software after the revised
				Terms have been posted will constitute your acceptance of the revised Terms.
			</p>

			<h3 className="font-bold">Termination</h3>
			<p>
				We reserve the right to terminate your access to the Software at any time and for any reason, without notice.
				Upon termination, you must cease all use of the Software and destroy any copies of the Software in your
				possession.
			</p>

			<h3 className="font-bold">Entire Agreement</h3>
			<p>These Terms constitute the entire agreement between you and us regarding the use of the Software.</p>
		</div>
	)
}
export default TermsOfService
