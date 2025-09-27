const express = require("express");
const {
  register,
  update,
  getAllCategories,
  getAll,
  getMeta,
  getCourse,
  getUserCourses,
  getApprovalList,
  getDetail
} = require("../../controllers/courseController");

const router = express.Router();

// Return valid status and level options
router.get("/_meta", getMeta);

router.get("/", getAll);

router.post("/register", register);

router.put("/:courseID", update);

router.get("/categories", getAllCategories);

router.get("/owner/:userID", getUserCourses);

router.get("/approval-list", getApprovalList);

router.get("/:courseID/detail", getDetail)

module.exports = router;
