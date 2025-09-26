const express = require("express");
const {
  getQuestion,
  getAnswerInQuestion,
  getAllInQuiz,
  getMeta,
} = require("../../../controllers/questionController");

const router = express.Router();

// Return valid status options
router.get("/_meta", getMeta);

router.get("/quiz/:quizID", getAllInQuiz);

router.get("/:questionID", getQuestion);

router.get("/:questionID/answer", getAnswerInQuestion);

module.exports = router;
