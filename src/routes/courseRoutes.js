const express = require("express");
const {
  register,
  update,
  getAllCategories,
  getAll,
  getCourseMeta,
  getCourse,
} = require("../controllers/courseController");

const router = express.Router();

router.post("/register", register);

router.post("/update", update);

router.post("/getAllCategories", getAllCategories);

router.post("/getAll", getAll);

// Return valid status and level options
router.post("/getCourseMeta", getCourseMeta);


router.get("/id", getCourse);


module.exports = router;
