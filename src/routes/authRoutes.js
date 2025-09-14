const express = require('express');
const { register, login, getCurrentUser, updateCurrentUser, verifyOTP, resendOTP } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);

router.post('/verify-otp', verifyOTP);

router.post('/resend-otp', resendOTP);

router.post('/login', login);

router.get('/me', getCurrentUser);

router.put('/me', updateCurrentUser);

module.exports = router;