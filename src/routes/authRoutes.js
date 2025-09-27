const express = require("express");
const {
  register,
  login,
  verifyOTP,
  resendOTP,
  sendResetPasswordOTP,
  verifyResetOTP,
  resetPassword,
  getCurrentUser,
  updateCurrentUser,
  getNonStudentUsers,
  updateUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

router.post("/verify-otp", verifyOTP);

router.post("/resend-otp", resendOTP);

router.post("/login", login);


router.post("/send-resetotp", sendResetPasswordOTP);

router.post("/verify-resetotp", verifyResetOTP);

router.post("/reset-password", resetPassword);

// Profile routes
router.get("/user", getCurrentUser);   // ✅ fetch user profile
router.put("/user", updateCurrentUser); // ✅ update user profile


// for admin page
router.get("/users", getNonStudentUsers);
router.put("/update", updateUser);

module.exports = router;
