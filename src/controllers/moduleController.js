const Module = require('../models/Module');
const Course = require('../models/Course');
const { VALID_MODULE_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const { courseid, title, description, status } = req.body;

        // Basic validataion
        if (!courseid || !title || !status) {
            return res.status(400).json({
                error: 'Course ID, owner ID, title, and status are required'
            });
        }

        // Validate status
        const moduleStatus = status || 'draft'

        if (!VALID_MODULE_STATUS.includes(moduleStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_MODULE_STATUS.join(', ')} `
            });
        }

        // Validate course ID
        const moduleCourse = Course.findById(courseid)
        if (!moduleCourse) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        }

        // Create course
        const newModule = await Module.create({
            courseid, 
            title, 
            description, 
            status: moduleStatus
        });

        res.json({
            message: 'Module registered successfully',
            module: {
                moduleid: newModule.moduleid,
                courseid: newModule.courseid,
                title: newModule.title,
                description: newModule.description,
                status: newModule.status,
            }
        })


    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const update = async (req, res) => {
    try {
        const { moduleid, courseid, title, description, status } = req.body;

        // Check if courseId exists
        const existingModule = await Module.findById(moduleid);
        if (!existingModule) {
            return res.status(404).json({
                error: 'Module not found'
            });
        }

        // Validate courseId
        if (!courseid) {
            return res.status(400).json({
                error: 'Course ID is required'
            });
        }

        // Check if courseId exists
        const existingCourse = await Course.findById(courseid);
        if (!existingCourse) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        // Validate status
        moduleStatus = status;
        if (moduleStatus !== undefined && !VALID_MODULE_STATUS.includes(moduleStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_MODULE_STATUS.join(', ')} `
            });
        }

        // Prepare update data
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = moduleStatus;

        // Update module
        const updateModule = await Module.update(moduleid, updateData)

        res.json({
            message: 'Module updated successfully',
            module: {
                moduleid: moduleid,
                courseid: updateModule.courseid,
                title: updateModule.title,
                description: updateModule.description,
                status: updateModule.status,
            }
        })

    } catch(error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getModuleMeta = (req, res) => {
    res.json({
        status: VALID_MODULE_STATUS,
    })
}


module.exports = {
  register,
  update,
  getModuleMeta,
};