const express = require("express");
const {
  register,
  update,
  getAllCategories,
  getAll,
  getMeta,
  getCourse,
} = require("../../controllers/courseController");
const moduleRoutes = require('./module');


const router = express.Router();

router.post("/register", register);

router.put("/:courseID", update);

router.post("/getAllCategories", getAllCategories);

router.post("/getAll", getAll);

// Return valid status and level options
router.post("/getMeta", getMeta);

router.get("/:courseID", getCourse);

// module routes
router.use('/:courseID/module', moduleRoutes);


module.exports = router;
