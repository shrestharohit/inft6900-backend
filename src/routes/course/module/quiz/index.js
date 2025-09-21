const express = require("express");
const {
  register,
  update,
  getAllInModule,
  getQuiz,
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


module.exports = router;
