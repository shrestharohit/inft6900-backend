const express = require("express");
const {
  getQuestion,
  getAllInQuiz,
  getMeta,
} = require("../../../../controllers/questionController");

const optionRoutes = require('./option')

const router = express.Router({ mergeParams: true });

// Return valid status options
router.get("/_meta", getMeta);

router.get("/", getAllInQuiz);

router.get("/:questionNumber", getQuestion);

router.use('/:questionNumber/option', optionRoutes);


module.exports = router;
