const CourseOwner = require('../models/CourseOwner');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { ownerID, department } = req.body;

    // Basic validation
    if (!ownerID) {
      return res.status(400).json({ 
        error: 'OwnerID is required' 
      });
    }

    // Check if owner actually exists
    const existingUser = await User.findById(ownerID);
    if (!existingUser) {
      return res.status(400).json({ 
        error: 'User not found.' 
      });
    }

    // Check if user role is CourseOwner
    if (existingUser.role !== 'course_owner') {
      return res.status(400).json({ 
        error: 'User role must be course owner.' 
      });
    }

    // Check if owner has already registered
    const existingOwner = await CourseOwner.findById(ownerID);
    if (existingOwner) {
      return res.status(400).json({ 
        error: 'Owner already registered.' 
      });
    }

    // Create owner
    const newOwner = await CourseOwner.create({
      ownerID,
      department
    });

    res.status(201).json({
        message: 'Registration successful!',
        owner: {
          ownerID: newOwner.ownerID,
          department: newOwner.department,
        },
    })
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const update = async (req, res) => {
  try {
    const { ownerID, department } = req.body;

    // Validate userId is provided
    if (!ownerID) {
      return res.status(400).json({ 
        error: 'Owner ID is required.' 
      });
    }

    // Check if user exists
    const existingOwner = await CourseOwner.findById(ownerID);
    if (!existingOwner) {
      return res.status(404).json({ 
        error: 'Course Owner not found' 
      });
    }

    // Prepare update data
    const updateData = {};
    if (department !== undefined) updateData.department = department;

    // Update user
    const updatedOwner = await CourseOwner.update(ownerID, updateData);

    res.json({
      message: 'Course Owner updated successfully',
      owner: {
        ownerID: updatedOwner.ownerID,
        department: updatedOwner.department,
      }
    });

  } catch (error) {
    console.error('Update course owner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  register,
  update
};