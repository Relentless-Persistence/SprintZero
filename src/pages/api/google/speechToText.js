import {SpeechClient} from "@google-cloud/speech"
import axios from "axios"

const handler = async (req, res) => {
	const {gcsUri} = req.body

	// Extract the file name from the storage URI
	const fileName = gcsUri.split("/").pop()

	// Extract the file extension from the file name
	const fileExtension = fileName.split(".").pop() // 'mp3'

	const serviceResponse = await axios.get(process.env.CLOUD_SERVICE_ACCOUNT)
	const serviceAccount = serviceResponse.data

	// const client = new SpeechClient({
	// 	keyFilename: serviceAccount, // Path to service key
	// 	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	// })

	const client = new SpeechClient({
		credentials: {
			client_email: serviceAccount.client_email,
			private_key: serviceAccount.private_key,
		},
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	})

	let config

	if (fileExtension === `mp3`) {
		config = {
			encoding: "MP3",
			sampleRateHertz: 16000,
			languageCode: "en-US",
		}
	} else if (fileExtension === "flac") {
		config = {
			encoding: "FLAC",
			languageCode: "en-US",
			sampleRateHertz: 44100,
		}
	} else if (fileExtension === `m4a`) {
		config = {
			encoding: `LINEAR16`,
			languageCode: `en-US`,
			audioChannelCount: 2,
			sampleRateHertz: 16000,
			enableSeparateRecognitionPerChannel: true,
			metadata: {
				originalMediaType: `AUDIO`,
				originalMimeType: `audio/m4a`,
			},
		}
	} else {
		config = {
			encoding: `LINEAR16`,
			languageCode: `en-US`,
			audioChannelCount: 2,
			enableSeparateRecognitionPerChannel: true,
		}
	}

	const audio = {
		uri: gcsUri,
	}

	const request = {
		config,
		audio,
	}

	try {
		const [operation] = await client.longRunningRecognize(request).catch(console.error)

		const [response] = await operation.promise().catch(console.error)

		const transcription = await response.results.map((result) => result.alternatives[0].transcript).join(`\n`)
		res.status(200).json({transcript: transcription})
	} catch (error) {
		res.status(400).json({error: error.details})
	}
}

export default handler
