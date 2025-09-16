const express = require("express");
const {
  register,
  update,
  getAll,
  getModuleMeta,
} = require("../controllers/moduleController");

const router = express.Router();

router.post("/register", register);

router.post("/update", update);

router.post("/getAll", getAll);

// Return valid status options
router.post("/getModuleMeta", getModuleMeta);



module.exports = router;
