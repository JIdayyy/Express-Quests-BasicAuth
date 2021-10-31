const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (req, res) => {
  const { language } = req.query;

  try {
    const users = await User.findMany({ filters: { language } });
    const usersWIthoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWIthoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving users from database");
  }
});

usersRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findOne(req.params.id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else res.status(404).send("User not found");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving user from database");
  }
});

usersRouter.post("/", async (req, res) => {
  const { password, email, ...body } = req.body;
  const hashedPassword = await User.hashPassword(password);
  let validationErrors = null;
  User.findByEmail(email)
    .then((existingUserWithEmail) => {
      if (existingUserWithEmail) return Promise.reject("DUPLICATE_EMAIL");
      validationErrors = User.validate(req.body);
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return User.create({ ...body, password: hashedPassword, email: email });
    })
    .then((createdUser) => {
      const { password, ...userWithoutPassword } = createdUser;
      res.status(201).json(userWithoutPassword);
    })
    .catch((err) => {
      console.error(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already used" });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error saving the user");
    });
});

usersRouter.put("/:id", async (req, res) => {
  let existingUser = null;
  let validationErrors = null;

  try {
    const user = await User.findOne(req.params.id);
    const userWithDifferentId = await User.findByEmailWithDifferentId(
      req.body.email,
      req.params.id
    );
    if (!user) throw new Error("RECORD_NOT_FOUND");
    if (userWithDifferentId) throw new Error("DUPLICATE_EMAIL");
    validationErrors = User.validate(req.body, false);
    if (validationErrors) throw new Error("INVALID_DATA");
    console.log("ok");
    const updatedUser = await User.update(req.params.id, req.body);
    const { password, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    if (err === "RECORD_NOT_FOUND")
      res.status(404).send(`User with id ${userId} not found.`);
    if (err === "DUPLICATE_EMAIL")
      res.status(409).json({ message: "This email is already used" });
    else if (err === "INVALID_DATA") res.status(422).json({ validationErrors });
    else res.status(500).send("Error updating a user");
  }
});

usersRouter.delete("/:id", (req, res) => {
  User.destroy(req.params.id)
    .then((deleted) => {
      if (deleted) res.status(200).send("🎉 User deleted!");
      else res.status(404).send("User not found");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error deleting a user");
    });
});

module.exports = usersRouter;
