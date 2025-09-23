const express = require("express");
const {
  registerOption,
  updateOption,
  getOption,
  getAllInQuestion,
  getAnswerInQuestion,
  getMeta,
} = require("../../../../controllers/optionController");

const router = express.Router({ mergeParams: true });

// Return valid status options
router.get("/_meta", getMeta);

router.get("/", getAllInQuestion);

router.post("/register", registerOption);

router.get("/answer", getAnswerInQuestion);

router.put("/:optionOrder", updateOption);

router.get("/:optionOrder", getOption);



module.exports = router;
