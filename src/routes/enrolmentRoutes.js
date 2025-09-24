const express = require("express");
const {
  enrolCourse,
  disenrolCourse,
  updateCourseEnrolment,
//   enrolPathway,
//   disenrolPathway,
//   updatePathwayEnrolment,
  getStudentEnrolment,
  getAll,
  getMeta,
} = require("../../controllers/courseController");
const moduleRoutes = require('./module');


const router = express.Router();

// Return valid status and level options
router.get("/_meta", getMeta);

router.get("/", getAll);

router.post("/course/:courseID", enrolCourse);

router.put("/course/:courseID/disenrol", disenrolCourse);

router.put("/course/:courseID/update", updateCourseEnrolment);

// router.post("/pathway/:pathwayID", enrolPathway);

// router.put("/pathway/:pathwayID/disenrol", disenrolPathway);

// router.put("/pathway/:pathwayID/update", updatePathwayEnrolment);

router.get("/:studentID", getStudentEnrolment);


module.exports = router;
