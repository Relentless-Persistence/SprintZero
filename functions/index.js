const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.addMessage = functions.https.onCall((data, context) => {
  const text = data.text;
  const auth = context.auth;

  return {
    text: text,
    user: auth,
  }
})