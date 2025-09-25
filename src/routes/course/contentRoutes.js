const express = require("express");
const {
  register,
  update,
  getAll,
  getMeta,
  getContent,
} = require('../../controllers/contentController');

const router = express.Router();

// Register new content for a module
router.post("/register/:moduleid", register);

// Update content by moduleID and contentID
router.put("/:moduleid/:contentid", update);

// Get all content
router.post("/getAll", getAll);

// Get metadata
router.post("/getMeta", getMeta);

// Get a single content by contentID
router.get("/:contentid", getContent);

module.exports = router;
