const express = require("express");
const {
  getOption,
  getAllInQuestion,
  getAnswerInQuestion,
  getMeta,
} = require("../../../../controllers/optionController");

const router = express.Router({ mergeParams: true });

// Return valid status options
router.get("/_meta", getMeta);

router.get("/", getAllInQuestion);

router.get("/answer", getAnswerInQuestion);

router.get("/:optionOrder", getOption);



module.exports = router;
