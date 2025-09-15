const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { VALID_USER_ROLES } = require('../config/constants');
const { generateOTP, sendOTPEmail } = require('../services/emailService');

const register = async (req, res) => {
  console.log("🚀 Inside register controller with body:", req.body);

  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      console.warn("⚠️ Missing required fields:", req.body);
      return res.status(400).json({ 
        error: 'First name, last name, email, and password are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn("⚠️ Invalid email format:", email);
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Password validation
    if (password.length < 6) {
      console.warn("⚠️ Password too short");
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.warn("⚠️ Duplicate email registration attempt:", email);
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Validate role
    const userRole = role || 'student';
    if (!VALID_USER_ROLES.includes(userRole)) {
      console.warn("⚠️ Invalid role:", role);
      return res.status(400).json({ 
        error: `Invalid role. Must be: ${VALID_USER_ROLES.join(', ')}` 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role: userRole
    });
    console.log("✅ User created in DB:", newUser);

    // Check if user needs email verification (only students need verification)
    if (userRole === 'student') {
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await User.setOTP(email, otpCode, expiresAt);
      console.log(`📧 OTP set for ${email}:`, otpCode);

      const emailResult = await sendOTPEmail(email, otpCode, firstName);
      if (!emailResult.success) {
        console.error("❌ Failed to send OTP email:", emailResult.error);
        return res.status(500).json({ 
          error: 'Failed to send verification email. Please try again.' 
        });
      }

      res.status(201).json({
        message: 'Registration successful! Please check your email for verification code.',
        email: email,
        expiresIn: '10 minutes',
        requiresVerification: true
      });
    } else {
      await User.markEmailVerified(email);
      console.log(`✅ Non-student user ${email} auto-verified`);

      res.status(201).json({
        message: 'Registration successful! Your account is ready to use.',
        user: {
          id: newUser.userID,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          isEmailVerified: true
        },
        requiresVerification: false
      });
    }

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  console.log("🚀 Inside login controller with body:", req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      console.warn("⚠️ Login failed - no user:", email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.warn("⚠️ Login failed - bad password for:", email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.role === 'student' && !user.isEmailVerified) {
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await User.setOTP(email, otpCode, expiresAt);
      console.log(`📧 Resent OTP to ${email}:`, otpCode);

      const emailResult = await sendOTPEmail(email, otpCode, user.firstName);
      if (!emailResult.success) {
        console.error("❌ Failed to send OTP email:", emailResult.error);
        return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
      }

      return res.status(200).json({
        message: 'Please verify your email to continue. A new verification code has been sent.',
        email: email,
        expiresIn: '10 minutes',
        requiresVerification: true,
        user: {
          id: user.userID,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: false
        }
      });
    }

    console.log("✅ Login successful:", email);
    res.json({
      message: 'Login successful',
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
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  console.log("🚀 Inside getCurrentUser with headers:", req.headers);

  try {
    const userId = req.headers['userid'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required in header or query parameter' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn("⚠️ getCurrentUser - not found:", userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("✅ getCurrentUser result:", user);
    res.json({ user });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCurrentUser = async (req, res) => {
  console.log("🚀 Inside updateCurrentUser with body:", req.body);

  try {
    const userId = req.headers['userid'] || req.query.userId;
    const { firstName, lastName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required in header or query parameter' });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    const updatedUser = await User.update(userId, updateData);
    console.log("✅ User updated:", updatedUser);

    res.json({ message: 'User updated successfully', user: updatedUser });

  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyOTP = async (req, res) => {
  console.log("🚀 Inside verifyOTP with body:", req.body);

  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Email and OTP code are required' });
    }

    const user = await User.verifyOTP(email, otpCode);
    if (!user) {
      console.warn("⚠️ Invalid or expired OTP for:", email);
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    const verifiedUser = await User.markEmailVerified(email);
    console.log("✅ OTP verified for:", email);

    res.status(200).json({ message: 'Email verified successfully!', user: verifiedUser });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resendOTP = async (req, res) => {
  console.log("🚀 Inside resendOTP with body:", req.body);

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    if (user.role !== 'student') {
      return res.status(400).json({ error: 'This account type does not require email verification' });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await User.setOTP(email, otpCode, expiresAt);
    console.log(`📧 Resent OTP for ${email}:`, otpCode);

    const emailResult = await sendOTPEmail(email, otpCode, user.firstName);
    if (!emailResult.success) {
      console.error("❌ Failed to send OTP email:", emailResult.error);
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }

    res.status(200).json({
      message: 'New verification code sent successfully!',
      email: email,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  verifyOTP,
  resendOTP
};
