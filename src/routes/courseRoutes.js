const express = require("express");
const {
  register,
  update,
  getAll,
  getCourseMeta,
} = require("../controllers/courseController");

const router = express.Router();

router.post("/register", register);

router.post("/update", update);

router.post("/getAll", getAll);

// Return valid status and level options
router.post("/getCourseMeta", getCourseMeta);



module.exports = router;
