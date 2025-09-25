const express = require("express");
const {
  register,
  update,
  getModule,
  getAll,
  getMeta,
} = require("../../controllers/moduleController");
const quizRoutes = require('./quiz/quizRoutes');

const router = express.Router();

// Return valid status options
router.get("/_meta", getMeta);

router.get("/course/:courseID", getAll);

router.post("/register", register);

router.put("/update/:moduleID", update);

router.get("/:moduleID", getModule);


module.exports = router;
