const authRouter = require("express").Router();
const User = require("../models/user");
const { calculateToken } = require("../helper/users");

authRouter.post("/checkCredentials", (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email).then((user) => {
    if (!user) {
      res.cookie("user_token", "");
      return res.status(401).json({ error: "Invalid Email" });
    } else {
      User.verifyPassword(password, user.password).then((passwordIsCorrect) => {
        if (passwordIsCorrect) {
          const token = calculateToken(email);
          User.update(user.id, { token: token });
          res.cookie("user_token", token);
          res.send();
        } else {
          res.cookie("user_token", "");
          return res.status(401).json({ error: "Invalid Password" });
        }
      });
    }
  });
});

module.exports = authRouter;
