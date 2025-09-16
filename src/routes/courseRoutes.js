const express = require("express");
const {
  register,
  update,
  getCourseMeta,
} = require("../controllers/courseController");

const router = express.Router();

router.post("/register", register);

router.post("/update", update);

// Return valid status and level options
router.post("/getCourseMeta", getCourseMeta);



module.exports = router;
