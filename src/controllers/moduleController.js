const Module = require('../models/Module');
const Course = require('../models/Course');
const { VALID_MODULE_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const { title, description, moduleNumber, expectedHours, status } = req.body;

        // Validate course id is provided
        if (!courseID) {
            return res.status(400).json({ 
                error: 'Course ID is required in header (courseID) or query parameter (courseID)' 
            });
        }

        // Basic validataion
        if (!title || !moduleNumber || !status) {
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
        const moduleCourse = await Course.findById(courseID)
        if (!moduleCourse) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        }

        // Validate module number
        if (!moduleNumber) {
            return res.status(400).json({
                error: 'Module number is required.'
            });
        }

        // Check if module number is already used in the course
        const existingModuleNumber = await Module.findByCourseIdModuleNumber(courseID, moduleNumber)
        if (existingModuleNumber) {
            return res.status(400).json({
                error: 'Selected module number already used in the selected course'
            });
        }

        // Create course
        const newModule = await Module.create({
            courseID, 
            title, 
            description, 
            moduleNumber,
            expectedHours,
            status: moduleStatus
        });

        res.json({
            message: 'Module registered successfully',
            module: {
                moduleID: newModule.moduleID,
                courseID: newModule.courseID,
                title: newModule.title,
                description: newModule.description,
                moduleNumber: newModule.moduleNumber,
                expectedHours: newModule.expectedHours,
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
        const courseID = req.params.courseID;
        const moduleID = req.params.moduleID;
        const { title, description, moduleNumber, expectedHours, status } = req.body;

        // Check if moduleID exists
        const existingModule = await Module.findById(moduleID);
        if (!existingModule) {
            return res.status(404).json({
                error: 'Module not found'
            });
        }

        // Validate courseId
        if (!moduleID) {
            return res.status(400).json({
                error: 'Module ID is required'
            });
        }

        // Check if courseId exists
        const existingCourse = await Course.findById(courseID);
        if (courseID !== undefined && !existingCourse) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        // Check if module number is already used in the course
        const currentModuleNumber = moduleNumber !== undefined ? moduleNumber : existingModule.moduleNumber;
        const existingModuleNumber = await Module.findByCourseIdModuleNumber(courseID, currentModuleNumber);

        if (existingModuleNumber && existingModuleNumber.moduleID !== parseInt(moduleID)) {
            return res.status(400).json({
                error: 'Selected module number already used in the selected course'
            });
        }

        // Validate status
        modulestatus = status;
        if (modulestatus !== undefined && !VALID_MODULE_STATUS.includes(modulestatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_MODULE_STATUS.join(', ')} `
            });
        }
        
        // Prepare update data
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (moduleNumber !== undefined) updateData.moduleNumber = moduleNumber;
        if (expectedHours !== undefined) updateData.expectedHours = expectedHours;
        if (status !== undefined) updateData.status = modulestatus;

        // Update module
        const updateModule = await Module.update(moduleID, updateData);

        res.json({
            message: 'Module updated successfully',
            module: {
                moduleID: moduleID,
                courseID: updateModule.courseID,
                title: updateModule.title,
                description: updateModule.description,
                moduleNumber: updateModule.moduleNumber,
                expectedHours: updateModule.expectedHours,
                status: updateModule.status,
            }
        });

    } catch(error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getModule = async (req, res) => {
    try {
        const moduleID = req.params.moduleID;
        const module = await Module.findById(moduleID);
        if (!module) {
            return res.status(400).json({
                error: 'Invalid module id. Module not found.'
            });
        }

        res.json(module);
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getAll = async (req, res) => {
    const modules = await Module.getAll();
    res.json(modules);
}


const getMeta = (req, res) => {
    res.json({
        status: VALID_MODULE_STATUS,
    })
}


module.exports = {
  register,
  update,
  getModule,
  getAll,
  getMeta,
};