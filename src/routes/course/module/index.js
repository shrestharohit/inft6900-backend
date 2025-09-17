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

router.put("/:moduleid", update);

router.get("/:moduleid", getModule);

router.post("/getAll", getAll);

// Return valid status options
router.post("/getMeta", getMeta);

// quiz routes
router.use('/:moduleid/quiz', quizRoutes);



module.exports = router;
