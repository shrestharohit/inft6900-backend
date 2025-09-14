const express = require('express');
const { register, login, getCurrentUser, updateCurrentUser, verifyOTP } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);

router.post('/verify-otp', verifyOTP);

router.post('/login', login);

router.get('/me', getCurrentUser);

router.put('/me', updateCurrentUser);

module.exports = router;