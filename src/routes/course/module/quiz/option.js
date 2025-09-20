const express = require("express");
const {
  register,
  update,
  getOption,
  getAllInQuestion,
  getAnswerInQuestion,
  getMeta,
} = require("../../../../controllers/optionController");

const router = express.Router({ mergeParams: true });

// Return valid status options
router.get("/_meta", getMeta);

router.get("/", getAllInQuestion);

router.post("/register", register);

router.get("/answer", getAnswerInQuestion);

router.put("/:optionOrder", update);

router.get("/:optionOrder", getOption);



module.exports = router;
