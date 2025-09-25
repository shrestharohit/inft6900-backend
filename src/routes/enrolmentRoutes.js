const express = require("express");
const {
  enrolCourse,
  disenrolCourse,
  getCourseEnrolment,
// pathway to be added after Zoey is done with pathway APIs
//   enrolPathway,
//   disenrolPathway,
//   updatePathwayEnrolment,
  getPopular,
  getUserEnrolment,
  getAll,
  getMeta,
} = require("../controllers/enrolmentController");

const router = express.Router();

// Return valid status and level options
router.get("/_meta", getMeta);

router.get("/", getAll);

router.get("/course/:courseID/", getCourseEnrolment);

router.post("/course/:courseID", enrolCourse);

router.put("/course/:courseID/disenrol", disenrolCourse);

// router.post("/pathway/:pathwayID", enrolPathway);

// router.put("/pathway/:pathwayID/disenrol", disenrolPathway);

// router.put("/pathway/:pathwayID/update", updatePathwayEnrolment);

router.get("/popular", getPopular);

router.get("/user/:userID", getUserEnrolment);


module.exports = router;
