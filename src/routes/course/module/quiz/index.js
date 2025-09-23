const express = require("express");
const {
  register,
  update,
  getQuiz,
  getDetail,
  getMeta
} = require("../../../../controllers/quizController");

const questionRoutes = require('./question')

const router = express.Router({ mergeParams: true });

// Return valid status options
router.get("/_meta", getMeta);

router.post("/register", register);

router.put("/", update);

router.get("/", getQuiz);

router.use('/question', questionRoutes);

router.get("/detail", getDetail);

module.exports = router;
