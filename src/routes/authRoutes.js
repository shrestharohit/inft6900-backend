const express = require("express");
const {
  register,
  login,
  verifyOTP,
  resendOTP,
  resetPassword,
  getCurrentUser,
  updateCurrentUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

router.post("/verify-otp", verifyOTP);

router.post("/resend-otp", resendOTP);

router.post("/login", login);

router.post("/reset-password", resetPassword);


module.exports = router;
