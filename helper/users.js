const jwt = require("jsonwebtoken");

const PRIVATE_KEY = "superSecretStringNowoneShouldKnowOrTheCanGenerateTokens";

const calculateToken = (userEmail, user_id = "") => {
  return jwt.sign({ email: userEmail, user_id }, PRIVATE_KEY);
};
module.exports = { calculateToken, PRIVATE_KEY };
