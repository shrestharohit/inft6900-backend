const express = require("express");
const {
  register,
  update,
  getModule,
  getAll,
  getMeta,
} = require("../../../controllers/moduleController");
const quizRoutes = require('./quiz');

const router = express.Router({ mergeParams: true });

// Return valid status options
router.get("/_meta", getMeta);

router.get("/", getAll);

router.post("/register", register);

router.put("/:moduleNumber", update);

router.get("/:moduleNumber", getModule);


// quiz routes
router.use('/:moduleNumber/quiz', quizRoutes);



module.exports = router;
