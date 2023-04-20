import {SpeechClient} from "@google-cloud/speech"

const client = new SpeechClient({
	keyFilename: `service.json`, // Path to service key
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
})

const handler = async (req, res) => {
	const {gcsUri} = req.body

	const config = {
		encoding: `LINEAR16`,
		languageCode: `en-US`,
		audioChannelCount: 2,
		enableSeparateRecognitionPerChannel: true,
	}

	const audio = {
		uri: gcsUri,
	}

	const request = {
		config,
		audio,
	}

	const [operation] = await client.longRunningRecognize(request)

	const [response] = await operation.promise()

	const transcription = await response.results.map((result) => result.alternatives[0].transcript).join(`\n`)
	res.status(200).json({transcript: transcription})
}

export default handler
