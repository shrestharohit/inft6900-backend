const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { VALID_USER_ROLES } = require('../config/constants');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        error: 'First name, last name, email, and password are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role
    const userRole = role || 'student';
    
    if (!VALID_USER_ROLES.includes(userRole)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be: ${VALID_USER_ROLES.join(', ')}` 
      });
    }

    // Create user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role: userRole
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.userID,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.userID,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.headers['userid'] || req.query.userId; // Get userId from header or query param

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required in header (userID) or query parameter (userId)' 
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      user: {
        id: user.userID,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.headers['userid'] || req.query.userId; // Get userId from header or query param
    const { firstName, lastName } = req.body;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required in header (userID) or query parameter (userId)' 
      });
    }

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Prepare update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // Update user
    const updatedUser = await User.update(userId, updateData);

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.userID,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        updated_at: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateCurrentUser
};