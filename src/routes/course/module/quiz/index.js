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

router.put("/", update);

router.get("/", getQuiz);

// Return valid status options
router.post("/getMeta", getMeta);


router.use('/question', questionRoutes);


module.exports = router;
