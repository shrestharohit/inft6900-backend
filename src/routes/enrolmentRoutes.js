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
  getMeta,
  testFunction
} = require("../controllers/enrolmentController");

const router = express.Router();

// Return valid status and level options
router.get("/_meta", getMeta);

router.get("/", getAll);

router.get("/course/:courseID/", getCourseEnrolment);

router.post("/course/:courseID", enrolCourse);

router.put("/course/:courseID/disenrol", disenrolCourse);

router.post("/pathway/:pathwayID", enrolPathway);

router.put("/pathway/:pathwayID/disenrol", disenrolPathway);

router.get("/popular", getPopular);

router.get("/user/:userID", getUserEnrolment);


module.exports = router;
