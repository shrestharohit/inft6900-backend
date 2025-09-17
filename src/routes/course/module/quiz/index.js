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

router.post("/register", register);

router.put("/:quizID", update);

router.get("/:quizID", getQuiz);

router.post("/getAll", getAllInModule);

// Return valid status options
router.post("/getMeta", getMeta);


router.use('/:quizID/question', questionRoutes);


module.exports = router;
