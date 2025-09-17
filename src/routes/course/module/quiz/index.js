const express = require("express");
const {
  register,
  update,
  getAllInModule,
  getQuiz,
  getMeta
} = require("../../../../controllers/quizController");

const router = express.Router({ mergeParams: true });

router.post("/register", register);

router.put("/:quizid", update);

router.get("/:quizid", getQuiz);

router.post("/getAll", getAllInModule);

// Return valid status options
router.post("/getMeta", getMeta);


module.exports = router;
