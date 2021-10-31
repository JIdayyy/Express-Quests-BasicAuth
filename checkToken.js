const cookie = require("cookie");
const User = require("./models/user");

module.exports = async function checkToken(req, res, next) {
  const { user_token } = cookie.parse(req.headers.cookie);

  const user = await User.findByToken(user_token);

  if (!user) {
    return res.status(401).send("Unauthorized");
  }

  next();
};
