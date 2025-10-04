const express = require("express");

const {
  register,
  update,
  getQuiz,
  getAllFromCourseOwner,
  getDetail,
  getMeta
} = require("../../../controllers/quizController");

const {
  startAttempt,
  submitAttemp,
  getQuizResult,
  getUserAttempts
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

router.get("/owner/:userID", getAllFromCourseOwner);

router.get("/:quizID", getQuiz);

router.get("/:quizID/detail", getDetail);


///////////////////////////////
// Student APIs
///////////////////////////////

router.post("/:quizID/start", startAttempt);

router.put("/:quizID/submit", submitAttemp);

router.get("/:quizID/result/:attemptID", getQuizResult);

router.get("/:quizID/user/:userID", getUserAttempts);


module.exports = router;
