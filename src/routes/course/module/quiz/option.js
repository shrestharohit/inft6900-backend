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

router.post("/register", register);

router.put("/:optionID", update);

router.get("/:optionID", getOption);

router.post("/getAll", getAllInQuestion);

router.post("/getAnswer", getAnswerInQuestion);

// Return valid status options
router.post("/optionID", getMeta);


module.exports = router;
