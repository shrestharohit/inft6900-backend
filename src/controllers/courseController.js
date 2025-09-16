const Course = require('../models/Course');
const CourseOwner = require('../models/CourseOwner');
const { VALID_COURSE_STATUS, VALID_COURSE_LEVEL } = require('../config/constants');

const register = async (req, res) => {
    try {
        const { title, ownerid, level, description, status } = req.body;

        // Basic validataion
        if (!title || !level || !description || !status) {
            return res.status(400).json({
                error: 'Title, ownerID, level, description and status are required'
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
            level: courseLevel, 
            description, 
            status: courseStatus
        });

        res.json({
            message: 'Course registered successfully',
            course: {
                id: newCourse.courseid,
                ownerid: newCourse.ownerid,
                title: newCourse.title,
                level: newCourse.level,
                description: newCourse.description,
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
        const { courseid, ownerid, title, level, description, status } = req.body;

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
        if (level !== undefined) updateData.level = courseLevel;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = courseStatus;

        // Create course
        const updateCourse = await Course.update(courseid, updateData)

        res.json({
            message: 'Course updated successfully',
            course: {
                id: updateCourse.courseid,
                ownerid: updateCourse.ownerid,
                title: updateCourse.title,
                level: updateCourse.level,
                description: updateCourse.description,
                status: updateCourse.status,
            }
        })

    } catch(error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getCourseMeta = (req, res) => {
    res.json({
        status: VALID_COURSE_STATUS,
        level: VALID_COURSE_LEVEL
    })
}


module.exports = {
  register,
  update,
  getCourseMeta,
};