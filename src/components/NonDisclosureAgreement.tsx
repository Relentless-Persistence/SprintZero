import type {FC} from "react"

const NonDiscolsureAgreement: FC = () => {
	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-lg font-bold">Non-Disclosure Agreement</h2>

			<p>
				This Non-Disclosure Agreement (&quot;Agreement&quot;) is entered into by and between the undersigned (&quot;Beta
				User&quot;) and Relentless Persistence, Inc. (&quot;SprintZero&quot;), for the purpose of protecting the
				confidential information of relentless persistence inc related to its web application called
				&quot;SprintZero&quot; (&quot;Application&quot;). WHEREAS, SprintZero is the owner of the Application and has
				developed it for the purpose of testing and gathering feedback from beta users; and WHEREAS, Beta User desires
				to participate in the beta testing of the Application; NOW, THEREFORE, in consideration of the mutual promises
				and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of
				which is hereby acknowledged, the parties agree as follows:
			</p>

			<h3 className="font-bold">CONFIDENTIAL INFORMATION</h3>
			<p>
				SprintZero may disclose to Beta User certain confidential and proprietary information concerning the Application
				and/or its development, including, but not limited to, software code, features, functions, designs,
				specifications, documentation, and data (collectively, &quot;Confidential Information&quot;). Beta User agrees
				that it will not use, copy, or disclose any Confidential Information, except as necessary to use the Application
				in accordance with its intended purposes.
			</p>

			<h3 className="font-bold">PROTECTION OF CONFIDENTIAL INFORMATION</h3>
			<p>
				Beta User agrees to use reasonable care to prevent the unauthorized use, disclosure, or publication of any
				Confidential Information. Beta User shall take all necessary measures to protect the Confidential Information,
				including, but not limited to, keeping it secure and limiting access to it on a need-to-know basis. Beta User
				shall not reproduce, modify, reverse engineer, decompile, or disassemble any Confidential Information.
			</p>

			<h3 className="font-bold">TERM</h3>
			<p>
				This Agreement shall commence upon the date it is executed by the parties and shall continue until the earlier
				of (i) the termination of Beta User&apos;s participation in the beta testing program, or (ii) termination of
				this Agreement by either party upon thirty (30) days&apos; prior written notice to the other party.
			</p>

			<h3 className="font-bold">OWNERSHIP</h3>
			<p>
				Beta User acknowledges and agrees that SprintZero retains all ownership rights, title, and interest in and to
				the Application and any Confidential Information disclosed by SprintZero pursuant to this Agreement.
			</p>

			<h3 className="font-bold">REMEDIES</h3>
			<p>
				Beta User acknowledges that any unauthorized use or disclosure of Confidential Information by Beta User may
				cause irreparable harm to SprintZero, for which money damages may not be an adequate remedy. SprintZero shall be
				entitled to seek injunctive relief, without the posting of a bond or other security, in addition to any other
				remedies available at law or in equity
			</p>

			<h3 className="font-bold">MISCELLANEOUS</h3>
			<ul className="list-disc pl-4">
				<li>
					This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof, and
					supersedes all prior negotiations, understandings, and agreements between the parties.
				</li>
				<li>
					This Agreement shall be binding upon and inure to the benefit of the parties and their respective successors
					and assigns.
				</li>
				<li>This Agreement may not be amended except in writing signed by both parties.</li>
				<li>
					This Agreement shall be governed by and construed in accordance with the laws of the State of [insert state],
					without regard to its conflicts of laws provisions.
				</li>
				<li>
					Any dispute arising under or related to this Agreement shall be resolved exclusively in the state or federal
					courts located in [insert county and state], and the parties consent to the personal jurisdiction of such
					courts.
				</li>
			</ul>
		</div>
	)
}

export default NonDiscolsureAgreement
