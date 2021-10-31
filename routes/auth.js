const authRouter = require("express").Router();
const User = require("../models/user");
const { calculateToken } = require("../helper/users");

authRouter.post("/checkCredentials", (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email).then((user) => {
    if (!user) res.status(401).send("Unknown User");
    else {
      console.log(user);
      User.verifyPassword(password, user.password).then((passwordIsCorrect) => {
        if (passwordIsCorrect) {
          const token = calculateToken(email, user.id);
          res.cookie("user_token", token);
          res.send();
        } else res.status(401).send("Invalid credentials");
      });
    }
  });
});

module.exports = authRouter;
