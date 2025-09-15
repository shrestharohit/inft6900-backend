const express = require('express');
const {
    register,
    login,
    getCurrentUser,
    updateCurrentUser,
    verifyOTP,
    resendOTP
} = require('../controllers/authController');

const router = express.Router();
console.log("✅ authRoutes loaded");

// --- Registration ---
router.post('/register', async (req, res, next) => {
    console.log("📩 POST /api/auth/register called with body:", req.body);
    try {
        await register(req, res, next);
    } catch (err) {
        console.error("❌ Error inside /register route:", err);
        next(err); // Pass to Express error handler
    }
});

// --- Verify OTP ---
router.post('/verify-otp', async (req, res, next) => {
    console.log("📩 POST /api/auth/verify-otp called with body:", req.body);
    try {
        await verifyOTP(req, res, next);
    } catch (err) {
        console.error("❌ Error inside /verify-otp route:", err);
        next(err);
    }
});

// --- Resend OTP ---
router.post('/resend-otp', async (req, res, next) => {
    console.log("📩 POST /api/auth/resend-otp called with body:", req.body);
    try {
        await resendOTP(req, res, next);
    } catch (err) {
        console.error("❌ Error inside /resend-otp route:", err);
        next(err);
    }
});

// --- Login ---
router.post('/login', async (req, res, next) => {
    console.log("📩 POST /api/auth/login called with body:", req.body);
    try {
        await login(req, res, next);
    } catch (err) {
        console.error("❌ Error inside /login route:", err);
        next(err);
    }
});

// --- Get Current User ---
router.get('/me', async (req, res, next) => {
    console.log("👤 GET /api/auth/me called with headers:", req.headers);
    try {
        await getCurrentUser(req, res, next);
    } catch (err) {
        console.error("❌ Error inside /me route:", err);
        next(err);
    }
});

// --- Update Current User ---
router.put('/me', async (req, res, next) => {
    console.log("✏️ PUT /api/auth/me called with body:", req.body);
    try {
        await updateCurrentUser(req, res, next);
    } catch (err) {
        console.error("❌ Error inside /me update route:", err);
        next(err);
    }
});

module.exports = router;
