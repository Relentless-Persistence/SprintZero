import axios from "axios";

const verifyRecaptcha = async (token) => {
  const secretKey = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY;

  var verificationUrl =
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
    secretKey +
    "&response=" +
    token;

  return await axios.post(verificationUrl);
};

export default async function handler(req, res) {
  const token = req.body.token;
  console.log("token", token)

  try {
    const response = await verifyRecaptcha(token);

    if (response.data.success && response.data.score >= 0.5) {
      return res
        .send(true)
    } else {
      return res.send(false);
    }
  } catch (error) {
    console.log("ERRRRROr", error);
    res.json({
      status: "Failed",
      message: "Something went wrong, please try again!!!",
    });
  }
}
