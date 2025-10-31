const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { VALID_USER_ROLES } = require('../config/constants');
const { generateOTP, sendOTPEmail, sendOTPEmailForpasswordReset, sendInitialPassword } = require('../services/emailService');
const { setInitialSettings } = require('./notificationSettingController');
const { initialisePomodoro } = require('./pomodoroSettingController');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validate role
    const userRole = role || 'student';
    let userPassword = ""
    
    if (!VALID_USER_ROLES.includes(userRole)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be: ${VALID_USER_ROLES.join(', ')}` 
      });
    }

    // Basic validation for student
    if (userRole === 'student') {
      if (!firstName || !lastName || !email ||!password) {
        return res.status(400).json({ 
          error: 'First name, last name, email and password are required' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters long' 
        });
      }
      
      userPassword = password;
    }

    // Basic validation for non-students
    if (['admin', 'course_owner'].includes(userRole)) {
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ 
          error: 'First name, last name and email are required' 
        });
      }

      // initial password generation
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*_+~|:./-";
      for (let i=0; i < 12; i++) {
        const random = Math.floor(Math.random() * chars.length);
        userPassword += chars[random];
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Please provide a valid email address",
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role: userRole,
    });

    // Initialise pomodoro setting & check if user needs email verification (only students need verification)
    if (userRole === "student") {
      // Initialise pomodoro setting for students only
      try {
        initialisePomodoro(newUser.userID);
      } catch(err) {
        console.log('User creaetd but error occured while initialising pomodoro setting: '&err)
        return res.status(400).json({
          error: "User creaetd but error occured while initialising pomodoro setting",
        });
      }

      // Generate OTP for students
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Store OTP in user record
      await User.setOTP(email, otpCode, expiresAt);

      // Send OTP
      const emailResult = await sendOTPEmail(email, otpCode, firstName);

      if (!emailResult.success) {
        console.warn(
          "⚠️ Failed to send OTP email, falling back to console only:",
          emailResult.error
        );

        // ✅ Still return success so frontend can go to /login2fa
        return res.status(201).json({
          message:
            "Registration successful! Please check your OTP in terminal (email not sent).",
          email: email,
          otpCode, // ⚠️ include only for dev testing, remove in prod
          expiresIn: "10 minutes",
          requiresVerification: true,
        });
      }

      // Normal case
      res.status(201).json({
        message:
          "Registration successful! Please check your email for verification code.",
        email: email,
        expiresIn: "10 minutes",
        requiresVerification: true,
      });
    } else {
      // Admin and course_owner are automatically verified
      await User.markEmailVerified(email);

      const emailResult = await sendInitialPassword(email, userPassword, firstName);
      
      if (!emailResult.success) {
        console.warn("⚠️ Failed to send initial password, falling back to console only:", emailResult.error);

        // ✅ Still return success so frontend can go to /login2fa
        return res.status(201).json({
          message: 'Registration successful! Please check initial password in terminal (email not sent).',
          email: email,
          userPassword // ⚠️ include only for dev testing, remove in prod
        });
      }

      // Normal case
      res.status(201).json({
        message: 'Registration successful! Initial password sent to a new user'
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Check if user needs email verification (only students need verification)
    if (user.role === "student" && !user.isEmailVerified) {
      // Generate new OTP for unverified students
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Store OTP in user record
      await User.setOTP(email, otpCode, expiresAt);

      // Send OTP email
      const emailResult = await sendOTPEmail(email, otpCode, user.firstName);

      if (!emailResult.success) {
        return res.status(500).json({
          error: "Failed to send verification email. Please try again.",
        });
      }

      return res.status(200).json({
        message:
          "Please verify your email to continue. A new verification code has been sent.",
        email: email,
        expiresIn: "10 minutes",
        requiresVerification: true,
        user: {
          id: user.userID,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: false,
        },
      });
    }

    // User is verified or doesn't need verification
    res.json({
      message: "Login successful",
      user: {
        id: user.userID,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId; // Get userId from header or query param

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({
        error:
          "User ID is required in header (userID) or query parameter (userId)",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      user: {
        id: user.userID,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId; // Get userId from header or query param
    const { firstName, lastName, password } = req.body;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({
        error:
          "User ID is required in header (userID) or query parameter (userId)",
      });
    }

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Prepare update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // Hash password
    if (password != undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters long",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.passwordHash = hashedPassword;
    }

    // Update user
    const updatedUser = await User.update(userId, updateData);

    res.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.userID,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        updated_at: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userID } = req.body;

    // Validate userId is provided
    if (!userID) {
      return res.status(400).json({ 
        error: 'User ID is required'
      });
    }

    // Check if user exists
    const existingUser = await User.findById(userID);
    if (!existingUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Update user
    const deletedUser = await User.deleteById(userID);

    res.json({
      message: 'User deleted successfully',
      deletedUser: deletedUser
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const updateUser = async (req, res) => {
  try {
    const { userID, firstName, lastName, currentPassword, newPassword, role, notificationEnabled } = req.body;

    // Validate userId is provided
    if (!userID) {
      return res.status(400).json({ 
        error: 'User ID is required'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findById(userID);
    if (!existingUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (role && !VALID_USER_ROLES.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be: ${VALID_USER_ROLES.join(', ')}` 
      });
    }

    let hashedPassword = null;
    if (newPassword) {
      // check if current password is valid
      if (!currentPassword) {
        return res.status(401).json({
          error: "To change password, current password required",
        });
      }

      const currentPasswordHash = (await User.findByEmail(existingUser.email)).passwordHash;
      
      const isPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // check if new apsswrod has more than 6 chars
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters long' 
        });
      }

      hashedPassword = await bcrypt.hash(newPassword, 10);
    }



    // Prepare update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role !== undefined) updateData.role = role;
    if (notificationEnabled !== undefined) updateData.notificationEnabled = notificationEnabled;
    if (hashedPassword !== null) updateData.passwordHash = hashedPassword;

    // Update user
    const updatedUser = await User.update(userID, updateData);

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.userID,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        notificationEnabled: updatedUser.notificationEnabled,
        updated_at: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    // Basic validation
    if (!email || !otpCode) {
      return res.status(400).json({
        error: "Email and OTP code are required",
      });
    }

    // Verify OTP
    const user = await User.verifyOTP(email, otpCode);
    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired OTP code",
      });
    }

    // Mark email as verified and clear OTP
    const verifiedUser = await User.markEmailVerified(email);
    req.session.verified = true;

    res.status(200).json({
      message: "Email verified successfully!",
      user: {
        id: verifiedUser.userID,
        firstName: verifiedUser.firstName,
        lastName: verifiedUser.lastName,
        email: verifiedUser.email,
        role: verifiedUser.role,
        isEmailVerified: verifiedUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Check if user exists and is not verified
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        error: "Email is already verified",
      });
    }

    // Check if user role requires verification (only students need verification)
    if (user.role !== "student") {
      return res.status(400).json({
        error: "This account type does not require email verification",
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update OTP in user record
    await User.setOTP(email, otpCode, expiresAt);

    // Send new OTP email
    const emailResult = await sendOTPEmail(email, otpCode, user.firstName);

    if (!emailResult.success) {
      return res.status(500).json({
        error: "Failed to send verification email. Please try again.",
      });
    }

    res.status(200).json({
      message: "New verification code sent successfully!",
      email: email,
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendResetPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Check if user exists and is not verified
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update OTP in user record
    await User.setOTP(email, otpCode, expiresAt);

    // Send new OTP email
    const emailResult = await sendOTPEmailForpasswordReset(email, otpCode, user.firstName);
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        error: 'Failed to send verification email. Please try again.' 
      });
    }

    res.status(200).json({
      message: 'New verification code sent successfully!',
      email: email,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Password reset email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const verifyResetOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    // Basic validation
    if (!email || !otpCode) {
      return res.status(400).json({ 
        error: 'Email and OTP code are required' 
      });
    }

    // Verify OTP
    const user = await User.verifyResetOTP(email, otpCode);
    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired OTP code' 
      });
    }

    req.session.verified = true;

    res.status(200).json({
      message: 'OTP verified successfully!',
      user: {
        id: user.userID,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!req.session.verified) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Basic validation
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "Email, new password and confirm password are required",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Use model method instead of raw query
    const updatedUser = await User.updatePassword(email, hashedPassword);

    if (!updatedUser) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    req.session.verified = false;
    res.json({
      message:
        "Password reset successful! You can now log in with your new password.",
      user: updatedUser,
    });
    
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getNonStudentUsers = async(req, res) => {
  try {
    const allNonStudents = await User.getAllNonStudents();
    res.json({
      users: allNonStudents
    });

  } catch(error) {
    console.error('Get all non student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  verifyOTP,
  resendOTP,
  sendResetPasswordOTP,
  verifyResetOTP,
  resetPassword,
  getNonStudentUsers,
  updateUser,
  deleteUser
};
