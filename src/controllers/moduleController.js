const Module = require('../models/Module');
const Course = require('../models/Course');
const { VALID_MODULE_STATUS } = require('../config/constants');

const register = async (req, res) => {
    try {
        const { courseid, title, description, modulenumber, expectedhours, status } = req.body;

        // Basic validataion
        if (!courseid || !title || !modulenumber || !status) {
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
        const moduleCourse = await Course.findById(courseid)
        if (!moduleCourse) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        }

        // Validate module number
        if (!modulenumber) {
            return res.status(400).json({
                error: 'Module number is required.'
            });
        }

        // Validate module number
        const existingModuleNumber = await Module.findByCourseIdModuleNumber(courseid, modulenumber)
        if (existingModuleNumber) {
            return res.status(400).json({
                error: 'Selected module number already used in the selected course'
            });
        }

        // Create course
        const newModule = await Module.create({
            courseid, 
            title, 
            description, 
            modulenumber,
            expectedhours,
            status: moduleStatus
        });

        res.json({
            message: 'Module registered successfully',
            module: {
                moduleid: newModule.moduleid,
                courseid: newModule.courseid,
                title: newModule.title,
                description: newModule.description,
                modulenumber: newModule.modulenumber,
                expectedhours: newModule.expectedhours,
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
        const { moduleid, courseid, title, description, modulenumber, expectedhours, status } = req.body;

        // Check if moduleID exists
        const existingModule = await Module.findById(moduleid);
        if (!existingModule) {
            return res.status(404).json({
                error: 'Module not found'
            });
        }

        // Validate courseId
        if (!moduleid) {
            return res.status(400).json({
                error: 'Module ID is required'
            });
        }

        // Check if courseId exists
        const existingCourse = await Course.findById(courseid);
        if (courseid !== undefined && !existingCourse) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        
        // Validate module number
        if (!modulenumber) {
            return res.status(400).json({
                error: 'Module number is required.'
            });
        }


        // Validate module number
        const currentCourseId = courseid !== undefined ? courseid : existingModule.courseid;
        const currentModuleNumber = modulenumber !== undefined ? modulenumber : existingModule.modulenumber;
        const existingModuleNumber = await Module.findByCourseIdModuleNumber(currentCourseId, currentModuleNumber);

        if (existingModuleNumber && existingModuleNumber.moduleid !== parseInt(moduleid)) {
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
        if (modulenumber !== undefined) updateData.modulenumber = modulenumber;
        if (expectedhours !== undefined) updateData.expectedhours = expectedhours;
        if (status !== undefined) updateData.status = modulestatus;

        // Update module
        const updateModule = await Module.update(moduleid, updateData);

        res.json({
            message: 'Module updated successfully',
            module: {
                moduleid: moduleid,
                courseid: updateModule.courseid,
                title: updateModule.title,
                description: updateModule.description,
                modulenumber: updateModule.modulenumber,
                expectedhours: updateModule.expectedhours,
                status: updateModule.status,
            }
        });

    } catch(error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getAll = async (req, res) => {
    const modules = await Module.getAll();
    res.json(modules);
}


const getModuleMeta = (req, res) => {
    res.json({
        status: VALID_MODULE_STATUS,
    })
}


module.exports = {
  register,
  update,
  getAll,
  getModuleMeta,
};