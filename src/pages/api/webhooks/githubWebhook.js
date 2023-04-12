const handler = async (req, res) => {
	console.log(req.payload)
	res.send("Github webhook successfully received")
}

export default handler
