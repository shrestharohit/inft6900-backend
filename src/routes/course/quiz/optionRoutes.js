const express = require("express");
const {
  getOption,
  getAllInQuestion,
  getMeta,
} = require("../../../controllers/optionController");

const router = express.Router();

// Return valid status options
router.get("/_meta", getMeta);

router.get("/:questionID", getAllInQuestion);

router.get("/:optionID", getOption);

module.exports = router;
