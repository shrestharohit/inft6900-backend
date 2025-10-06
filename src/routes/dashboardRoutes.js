const express = require('express');
const { 
    getCourseOwnerData
} = require('../controllers/dashboardController');

const router = express.Router();

// Retrieve dashboard data for courseowner
router.get('/owner/:userID', getCourseOwnerData);


module.exports = router;
