const express = require('express');
const { 
    getCourseOwnerData,
    getAdminData,
} = require('../controllers/dashboardController');

const router = express.Router();

// Retrieve dashboard data for courseowner
router.get('/owner/:userID', getCourseOwnerData);

// Retrieve dashboard data for admin
router.get('/admin', getAdminData);

module.exports = router;
