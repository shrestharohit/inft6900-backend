const Course = require('../models/Course');
const CourseOwner = require('../models/CourseOwner');
const { VALID_COURSE_STATUS, VALID_COURSE_LEVEL } = require('../config/constants');

const register = async (req, res) => {
    try {
        const { title, ownerID, category, level, outline, status } = req.body;

        // Basic validataion
        if (!title || !category || !level || !outline || !status) {
            return res.status(400).json({
                error: 'Title, ownerID, level, outline and status are required'
            });
        }

        // Validate owner id
        const existingOwner = await CourseOwner.findById(ownerID)
        if (!existingOwner) {
            return res.status(400).json({
                error: 'Invalid owner ID. Course Owner does not exist.'
            });
        }

        // Validate level
        const courseLevel = level || 'beginner'

        if (!VALID_COURSE_LEVEL.includes(courseLevel)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_COURSE_LEVEL.join(', ')} `
            });
        }

        // Validate status
        const courseStatus = status || 'draft'

        if (!VALID_COURSE_STATUS.includes(courseStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_COURSE_STATUS.join(', ')} `
            });
        }

        // Create course
        const newCourse = await Course.create({
            ownerID,
            title, 
            category,
            level: courseLevel, 
            outline, 
            status: courseStatus
        });

        res.json({
            message: 'Course registered successfully',
            course: {
                id: newCourse.courseID,
                ownerID: newCourse.ownerID,
                title: newCourse.title,
                category: newCourse.category,
                level: newCourse.level,
                outline: newCourse.outline,
                status: newCourse.status,
            }
        })

    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const update = async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const { ownerID, title, category, level, outline, status } = req.body;

        // Validate courseId
        if (!courseID) {
            return res.status(400).json({
                error: 'Course ID is required'
            });
        }

        // Check if courseId exists
        const existingCourse = await Course.findById(courseID);
        if (!existingCourse) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        // Validate owner id
        const existingOwner = await CourseOwner.findById(ownerID)
        if (!existingOwner) {
            return res.status(400).json({
                error: 'Invalid owner ID. Course Owner does not exist.'
            });
        }

        // Validate level
        courseLevel = level;
        if (courseLevel !== undefined && !VALID_COURSE_LEVEL.includes(courseLevel)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_COURSE_LEVEL.join(', ')} `
            });
        }

        // Validate status
        courseStatus = status;
        if (courseStatus !== undefined && !VALID_COURSE_STATUS.includes(courseStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_COURSE_STATUS.join(', ')} `
            });
        }

        // Prepare update data
        const updateData = {};
        if (ownerID !== undefined) updateData.ownerID = ownerID;
        if (title !== undefined) updateData.title = title;
        if (category !== undefined) updateData.category = category;
        if (level !== undefined) updateData.level = courseLevel;
        if (outline !== undefined) updateData.outline = outline;
        if (status !== undefined) updateData.status = courseStatus;

        // Create course
        const updateCourse = await Course.update(courseID, updateData)

        res.json({
            message: 'Course updated successfully',
            course: {
                id: updateCourse.courseID,
                ownerID: updateCourse.ownerID,
                title: updateCourse.title,
                category: updateCourse.category,
                level: updateCourse.level,
                outline: updateCourse.outline,
                status: updateCourse.status,
            }
        })

    } catch(error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getAllCategories = async (req, res) => {
    const categories = await Course.getAllCategories();
    res.json(categories);
}


const getAll = async (req, res) => {
    const courses = await Course.getAll();
    res.json(courses);
}


const getMeta = (req, res) => {
    res.json({
        status: VALID_COURSE_STATUS,
        level: VALID_COURSE_LEVEL
    })
}

const getCourse = async (req, res) => {
  try {
    const courseId = req.params.courseID || req.query.courseID; // Get courseID from header or query param

    // Validate course id is provided
    if (!courseId) {
      return res.status(400).json({ 
        error: 'Course ID is required in header (courseID) or query parameter (courseID)' 
      });
    }

    // Find user by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        error: 'Course not found' 
      });
    }

    res.json(course);

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  register,
  update,
  getAllCategories,
  getAll,
  getMeta,
  getCourse
};