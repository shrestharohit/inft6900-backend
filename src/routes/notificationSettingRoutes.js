const express = require("express");
const {
  saveSettings,
  getUserSettings,
  getMeta
} = require('../controllers/notificationSettingController');

const router = express.Router();

// Register new pathway
router.post("/save", saveSettings);

// Get a single pathway by pathwayID
router.get("/user/:userID", getUserSettings);

// Get detailed pathway info
router.get("/_meta", getMeta);

module.exports = router;
