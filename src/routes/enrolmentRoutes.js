const express = require("express");
const {
  enrolCourse,
  disenrolCourse,
  getCourseEnrolment,
  enrolPathway,
  disenrolPathway,
  getPopular,
  getUserEnrolment,
  getAll,
  getEnrolment,
  getMeta
} = require("../controllers/enrolmentController");

const router = express.Router();

// Return valid status and level options
router.get("/_meta", getMeta);

router.get("/course/:courseID/", getCourseEnrolment);

router.post("/course/:courseID", enrolCourse);

router.put("/course/:courseID/disenrol", disenrolCourse);

router.post("/pathway/:pathwayID", enrolPathway);

router.put("/pathway/:pathwayID/disenrol", disenrolPathway);

router.get("/popular", getPopular);

router.get("/user/:userID", getUserEnrolment);

router.get("/:enrolmentID", getEnrolment);

router.get("/", getAll);



module.exports = router;
