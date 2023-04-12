import {verify} from "crypto"

// const secret = `your-github-webhook-secret`

const handler = async (req, res) => {
	if (req.method !== `POST`) {
		res.status(405).end()
		return
	}

	// const signature = req.headers[`x-hub-signature-256`]
	const event = req.headers[`x-github-event`]

	const body = req.body
	// const hmac = verifySignature(body, secret, signature)

	// if (!hmac) {
	// 	res.status(400).end()
	// 	return
	// }

	// const payload = JSON.parse(body)
	console.log(`Received event from Github: `, body)

	res.status(200).json({message: `Github webhook successfully received`})
}

// function verifySignature(body: Buffer, secret: string, signature: string) {
// 	const hmac = verify(`sha256=${signature}`, secret, body)

// 	return hmac
// }

// async function getRawBody(req: NextApiRequest) {
// 	return new Promise()<Buffer>((resolve, reject) => {
// 		let body = Buffer.alloc(0)

// 		req.on(`data`, (chunk) => {
// 			body = Buffer.concat([body, chunk])
// 		})

// 		req.on(`end`, () => {
// 			resolve(body)
// 		})

// 		req.on(`error`, (err) => {
// 			reject(err)
// 		})
// 	})
// }

export default handler
