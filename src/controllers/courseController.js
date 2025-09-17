const Course = require('../models/Course');
const CourseOwner = require('../models/CourseOwner');
const { VALID_COURSE_STATUS, VALID_COURSE_LEVEL } = require('../config/constants');

const register = async (req, res) => {
    try {
        const { title, ownerid, category, level, outline, status } = req.body;

        // Basic validataion
        if (!title || !category || !level || !outline || !status) {
            return res.status(400).json({
                error: 'Title, ownerID, level, outline and status are required'
            });
        }

        // Validate owner id
        const existingOwner = CourseOwner.findById(ownerid)
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
            ownerid,
            title, 
            category,
            level: courseLevel, 
            outline, 
            status: courseStatus
        });

        res.json({
            message: 'Course registered successfully',
            course: {
                id: newCourse.courseid,
                ownerid: newCourse.ownerid,
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
        const { courseid, ownerid, title, category, level, outline, status } = req.body;

        // Validate courseId
        if (!courseid) {
            return res.status(400).json({
                error: 'Course ID is required'
            });
        }

        // Validate owner id
        const existingOwner = CourseOwner.findById(ownerid)
        if (!existingOwner) {
            return res.status(400).json({
                error: 'Invalid owner ID. Course Owner does not exist.'
            });
        }

        // Check if courseId exists
        const existingCourse = await Course.findById(courseid);
        if (!existingCourse) {
            return res.status(404).json({
                error: 'User not found'
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
        if (ownerid !== undefined) updateData.ownerid = ownerid;
        if (title !== undefined) updateData.title = title;
        if (category !== undefined) updateData.category = category;
        if (level !== undefined) updateData.level = courseLevel;
        if (outline !== undefined) updateData.outline = outline;
        if (status !== undefined) updateData.status = courseStatus;

        // Create course
        const updateCourse = await Course.update(courseid, updateData)

        res.json({
            message: 'Course updated successfully',
            course: {
                id: updateCourse.courseid,
                ownerid: updateCourse.ownerid,
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


const getCourseMeta = (req, res) => {
    res.json({
        status: VALID_COURSE_STATUS,
        level: VALID_COURSE_LEVEL
    })
}

const getCourse = async (req, res) => {
  try {
    const courseId = req.params.id || req.query.courseid; // Get courseid from header or query param

    // Validate userId is provided
    if (!courseId) {
      return res.status(400).json({ 
        error: 'Course ID is required in header (userID) or query parameter (userId)' 
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
  getCourseMeta,
  getCourse
};