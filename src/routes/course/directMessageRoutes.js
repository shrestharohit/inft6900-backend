const express = require("express");
const {
  register,
  update,
  getCourseMessages,
  getUserMessages,
  getAllReceivedMessages,
  getMessage,
  getMeta
} = require("../../controllers/directMessageController");

const router = express.Router();

// Return valid status options
router.get("/_meta", getMeta);

router.post("/register", register);

router.put("/update/:msgID", update);

router.get("/course/:courseID", getCourseMessages);

router.get("/user/:userID", getUserMessages);

router.get("/owner/:userID", getAllReceivedMessages);

router.get("/:msgID", getMessage);


module.exports = router;
