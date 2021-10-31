const moviesRouter = require("express").Router();
const Movie = require("../models/movie");
const checkToken = require("../checkToken");
const User = require("../models/user");
const cookie = require("cookie");

moviesRouter.get("/", checkToken, async (req, res) => {
  const { max_duration, color } = req.query;

  const { user_token } = cookie.parse(req.headers.cookie);
  const { id: user_id } = await User.findByToken(user_token);

  Movie.findMany({ filters: { max_duration, color, user_id } })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving movies from database");
    });
});

moviesRouter.get("/", async (req, res) => {
  const { max_duration, color } = req.query;
  Movie.findMany({ filters: { max_duration, color } })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      res.status(500).send("Error retrieving movies from database");
    });
});

moviesRouter.get("/:id", (req, res) => {
  Movie.findOne(req.params.id)
    .then((movie) => {
      if (movie) {
        res.json(movie);
      } else {
        res.status(404).send("Movie not found");
      }
    })
    .catch((err) => {
      res.status(500).send("Error retrieving movie from database");
    });
});

moviesRouter.post("/", checkToken, async (req, res) => {
  // I added this in order to get the user and return the user_id
  // But the token is validate by the checkToken middleware

  const { user_token } = cookie.parse(req.headers.cookie);
  const { id: user_id } = await User.findByToken(user_token);
  console.log(user_id);
  const error = Movie.validate(req.body);
  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
    Movie.create({ ...req.body, user_id })
      .then((createdMovie) => {
        res.status(201).json(createdMovie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error saving the movie");
      });
  }
});

moviesRouter.put("/:id", (req, res) => {
  let existingMovie = null;
  let validationErrors = null;
  Movie.findOne(req.params.id)
    .then((movie) => {
      existingMovie = movie;
      if (!existingMovie) return Promise.reject("RECORD_NOT_FOUND");
      validationErrors = Movie.validate(req.body, false);
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return Movie.update(req.params.id, req.body);
    })
    .then(() => {
      res.status(200).json({ ...existingMovie, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`Movie with id ${req.params.id} not found.`);
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors: validationErrors.details });
      else res.status(500).send("Error updating a movie.");
    });
});

moviesRouter.delete("/:id", (req, res) => {
  Movie.destroy(req.params.id)
    .then((deleted) => {
      if (deleted) res.status(200).send("🎉 Movie deleted!");
      else res.status(404).send("Movie not found");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error deleting a movie");
    });
});

module.exports = moviesRouter;
