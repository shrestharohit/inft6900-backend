const express = require("express");
const {
  register,
  update,
  getCourseReviews,
  getPathwayReviews,
  getUserReviews,
  getReview,
  getTopReviews,
  getMeta
} = require("../../controllers/reviewController");

const router = express.Router();

// Return valid status options
router.get("/_meta", getMeta);

router.post("/register", register);

router.put("/update/:reviewID", update);

router.get("/course/:courseID", getCourseReviews);

router.get("/pathway/:pathwayID", getPathwayReviews);

router.get("/user/:userID", getUserReviews);

router.get("/topReviews", getTopReviews);


router.get("/:reviewID", getReview);


module.exports = router;
