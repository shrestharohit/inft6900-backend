const express = require("express");
const {
  register,
  update,
  getAll,
  getPathway,
  getUserPathways,
  getMeta,
  getApprovalList,
  getDetail,
  getCoursesInPathway
} = require('../controllers/pathwayController');

const router = express.Router();

// Register new pathway
router.post("/register", register);

// Update pathway by pathwayID
router.put("/:pathwayid", update);

// Get all pathways
router.get("/getAll", getAll);

// Get metadata
router.get("/getMeta", getMeta);

// Get a single pathway by pathwayID
router.get("/user/:userID", getUserPathways);

// Get a single pathway by pathwayID
router.get("/:pathwayid", getPathway);

// Get approval list
router.get("/approval/list", getApprovalList);     

// Get detailed pathway info
router.get("/:pathwayid/detail", getDetail);

// Get all courses in a pathway
router.get("/:pathwayid/courses", getCoursesInPathway);

module.exports = router;
