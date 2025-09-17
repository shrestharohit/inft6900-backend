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

router.put("/:courseid", update);

router.post("/getAllCategories", getAllCategories);

router.post("/getAll", getAll);

// Return valid status and level options
router.post("/getMeta", getMeta);

router.get("/:courseid", getCourse);

// module routes
router.use('/:courseid/module', moduleRoutes);


module.exports = router;
