const express = require('express');
const { issue, getByUser, getByCourse } = require('../../controllers/certificateController');
const router = express.Router();

// Issue certificate
router.post('/issue', issue);

// Get certificates by userID
router.get('/user/:userid', getByUser);

// Get certificates by courseID
router.get('/course/:courseid', getByCourse);

module.exports = router;
