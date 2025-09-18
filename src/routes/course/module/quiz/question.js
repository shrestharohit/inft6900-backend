const express = require("express");
const {
  register,
  update,
  getQuestion,
  getAllInQuiz,
  getMeta,
} = require("../../../../controllers/questionController");

const optionRoutes = require('./option')

const router = express.Router({ mergeParams: true });

router.post("/register", register);

router.put("/:questionID", update);

router.get("/:questionID", getQuestion);

router.post("/getAll", getAllInQuiz);

// Return valid status options
router.post("/getMeta", getMeta);


router.use('/:questionID/option', optionRoutes);


module.exports = router;
