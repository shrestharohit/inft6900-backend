const express = require("express");
const {
  register,
  update,
  getAll,
  getPathway,
  getMeta,
} = require('../controllers/pathwayController');

const router = express.Router();

// Register new pathway
router.post("/register", register);

// Update pathway by pathwayID
router.put("/:pathwayid", update);

// Get all pathways
router.post("/getAll", getAll);

// Get metadata (status options)
router.post("/getMeta", getMeta);

// Get a single pathway by pathwayID
router.get("/:pathwayid", getPathway);

module.exports = router;
