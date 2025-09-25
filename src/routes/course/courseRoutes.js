const express = require("express");
const {
  register,
  update,
  getAllCategories,
  getAll,
  getMeta,
  getCourse,
} = require("../../controllers/courseController");

const router = express.Router();

// Return valid status and level options
router.get("/_meta", getMeta);

router.get("/", getAll);

router.post("/register", register);

router.put("/:courseID", update);

router.get("/categories", getAllCategories);

router.get("/:courseID", getCourse);


module.exports = router;
