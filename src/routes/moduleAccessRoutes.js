const express = require('express');
const { register, getByUser, getByModule } = require('../controllers/moduleAccessController');
const router = express.Router();

// Record module access
router.post('/register', register);

// Get all accesses by userID
router.get('/user/:userid', getByUser);

// Get all accesses by moduleID
router.get('/module/:moduleid', getByModule);

module.exports = router;
