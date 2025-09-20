const express = require("express");
const {
  register,
  update,
  getQuestion,
  getAllInQuiz,
  getMeta,
} = require("../../../../controllers/questionController");

const optionRoutes = require('./option')

const router = express.Router({ mergeParams: true });

// Return valid status options
router.get("/_meta", getMeta);

router.get("/", getAllInQuiz);

router.post("/register", register);

router.put("/:questionNumber", update);

router.get("/:questionNumber", getQuestion);

router.use('/:questionNumber/option', optionRoutes);


module.exports = router;
