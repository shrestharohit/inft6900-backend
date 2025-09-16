const express = require("express");
const {
  register,
  update,
  getModuleMeta,
} = require("../controllers/moduleController");

const router = express.Router();

router.post("/register", register);

router.post("/update", update);

// Return valid status options
router.post("/getModuleMeta", getModuleMeta);



module.exports = router;
