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

router.post("/register", register);

router.put("/:moduleID", update);

router.get("/:moduleID", getModule);

router.post("/getAll", getAll);

// Return valid status options
router.post("/getMeta", getMeta);

// quiz routes
router.use('/:moduleID/quiz', quizRoutes);



module.exports = router;
