const express = require("express");
const {
  register,
  update,
} = require("../controllers/ownerController");

const router = express.Router();

router.post("/register", register);

router.post("/update", update);

module.exports = router;
