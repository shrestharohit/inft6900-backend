const express = require("express");

const {
  register,
  update,
  getQuiz,
  getDetail,
  getMeta
} = require("../../../controllers/quizController");

const {
  startAttempt,
  submitAttemp,
  getQuizResult
} = require("../../../controllers/attemptController");


const questionRoutes = require('./questionRoutes')

const router = express.Router();


///////////////////////////////
// CourseOwner APIs
///////////////////////////////

// Return valid status options
router.get("/_meta", getMeta);

router.post("/register", register);

router.put("/update/:quizID", update);

router.get("/:quizID", getQuiz);

router.get("/:quizID/detail", getDetail);


///////////////////////////////
// Student APIs
///////////////////////////////

router.post("/:quizID/start", startAttempt);

router.put("/:quizID/submit", submitAttemp);

router.get("/:quizID/result/:attemptID", getQuizResult);


module.exports = router;
