const express = require('express');
const { 
    register, 
    getByUser, 
    getByModule, 
    getLastAccess,     
    getAllAccesses 
} = require('../controllers/moduleAccessController');

const router = express.Router();

// Record module access
router.post('/register', register);

// Get all accesses by userID
router.get('/user/:userid', getByUser);

// Get all accesses by moduleID
router.get('/module/:moduleid', getByModule);

// Get last access date of a module for a user
router.get('/module/:moduleid/user/:userid/last', getLastAccess);

// Get all accesses of a module for a user
router.get('/module/:moduleid/user/:userid', getAllAccesses);

module.exports = router;
