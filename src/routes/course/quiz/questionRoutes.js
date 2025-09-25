const express = require("express");
const {
  getQuestion,
  getAllInQuiz,
  getMeta,
} = require("../../../controllers/questionController");

const router = express.Router();

// Return valid status options
router.get("/_meta", getMeta);

router.get("/:quizID", getAllInQuiz);

router.get("/:questionID", getQuestion);


module.exports = router;
