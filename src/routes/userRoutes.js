const express = require("express");
const {
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/authController");

const router = express.Router();

router.get("/me", getCurrentUser);

router.put("/me", updateCurrentUser);

module.exports = router;
