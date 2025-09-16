const CourseOwner = require('../models/CourseOwner');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { ownerid, department } = req.body;

    // Basic validation
    if (!ownerid) {
      return res.status(400).json({ 
        error: 'OwnerID is required' 
      });
    }

    // Check if owner actually exists
    const existingUser = await User.findById(ownerid);
    if (!existingUser) {
      return res.status(400).json({ 
        error: 'User not found.' 
      });
    }

    // Check if owner actually exists
    const existingOwner = await CourseOwner.findById(ownerid);
    if (existingOwner) {
      return res.status(400).json({ 
        error: 'Owner already registered.' 
      });
    }

    // Create user
    const newOwner = await CourseOwner.create({
      ownerid,
      department
    });

    res.status(201).json({
        message: 'Registration successful!',
        owner: {
          ownerid: newOwner.ownerid,
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
    const { ownerid, department } = req.body;

    // Validate userId is provided
    if (!ownerid) {
      return res.status(400).json({ 
        error: 'Owner ID is required.' 
      });
    }

    // Check if user exists
    const existingOwner = await CourseOwner.findById(ownerid);
    if (!existingOwner) {
      return res.status(404).json({ 
        error: 'Course Owner not found' 
      });
    }

    // Prepare update data
    const updateData = {};
    if (department !== undefined) updateData.department = department;

    // Update user
    const updatedOwner = await CourseOwner.update(ownerid, updateData);

    res.json({
      message: 'Course Owner updated successfully',
      owner: {
        ownerid: updatedOwner.ownerid,
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