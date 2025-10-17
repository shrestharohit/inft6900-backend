const express = require("express");
const {
    register,
    update,
    getUserSettings,
} = require('../controllers/pomodoroSettingController');

const router = express.Router();


// Register new pathway
router.post("/register", register);

// Register new pathway
router.put("/user/:userID", update);

// Get a single pathway by pathwayID
router.get("/user/:userID", getUserSettings);

module.exports = router;
