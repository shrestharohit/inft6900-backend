const Module = require('../models/Module');
const User = require('../models/User');
const Course = require('../models/Course');
const Content = require('../models/Content');
const { VALID_MODULE_STATUS } = require('../config/constants');
const { pool } = require('../config/database');
const { registerContent, updateContent } = require('../controllers/contentController');
const { syncContentStatus } = require('./contentController');

const register = async (req, res) => {
    const client = await pool.connect();
    await client.query('BEGIN')

    try {
        const { courseID, title, description, moduleNumber, expectedHours, status, contents } = req.body;
        for (const c of contents) {
            console.log(c.description)
        }
        // Validate course id is provided
        if (!courseID) {
            return res.status(400).json({ 
                error: 'Course ID is required in header (courseID) or query parameter (courseID)' 
            });
        };

        // Basic validataion
        if (!title || !moduleNumber || !status ||!contents || contents.length === 0) {
            return res.status(400).json({
                error: 'Title, module number, status and contents are required'
            });
        };

        // Validate status
        const moduleStatus = status || 'draft'

        if (!VALID_MODULE_STATUS.includes(moduleStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_MODULE_STATUS.join(', ')} `
            });
        };

        // Validate course ID
        const moduleCourse = await Course.findById(courseID)
        if (!moduleCourse) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        };

        // Validate module number
        if (!moduleNumber) {
            return res.status(400).json({
                error: 'Module number is required.'
            });
        };

        // Check if module number is already used in the course
        const existingModuleNumber = await Module.findByCourseIdModuleNumber(courseID, moduleNumber)
        if (existingModuleNumber) {
            return res.status(400).json({
                error: 'Selected module number already used in the selected course'
            });
        };

        // Create module
        const newModule = await Module.create({
            courseID, 
            title, 
            description, 
            moduleNumber,
            expectedHours,
            status: moduleStatus
        }, client);

        // Create contents after creating module
        const newContents = [];
        for (const content of contents) {
            try {
                let newContent = await registerContent({
                    moduleID: newModule.moduleID,
                    title: content.title,
                    description: content.description,
                    pageNumber: content.pageNumber,
                    status: content.status
                }, client)

                newContents.push(newContent);
            } catch(err) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: 'Error occured while registering content. ' + err
                });
            }
        }

        await client.query('COMMIT');

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
                contents: newContents
            }
        })


    } catch(error) {
        await client.query('ROLLBACK');
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};


const update = async (req, res) => {
    const client = await pool.connect();
    await client.query('BEGIN')

    try {
        const moduleID = req.params.moduleID; 
        const { title, description, moduleNumber, expectedHours, status, contents } = req.body;

        // Validate module ID
        if (!moduleID) {
            return res.status(404).json({
                error: 'Module id is required'
            });
        }

        // Check if moduleID exists
        const existingModule = await Module.findById(moduleID);
        if (!existingModule) {
            return res.status(404).json({
                error: 'Module not found'
            });
        }

        // Check if module number is already used in the course
        const isUsedModuleNumber = !!(await Module.findByCourseIdModuleNumber(existingModule.courseID, moduleNumber));

        if (existingModule.moduleNumber !== moduleNumber && isUsedModuleNumber) {
            return res.status(400).json({
                error: 'Selected module number already used in the selected course'
            });
        }

        // Validate status
        moduleStatus = status;
        if (moduleStatus !== undefined && !VALID_MODULE_STATUS.includes(moduleStatus)) {
            return res.status(400).json({
                error: `Invalid status. Must be:${VALID_MODULE_STATUS.join(', ')} `
            });
        }
        
        // any missing content will be treated as deleted (inactive) 
        const contentIDs = (await Content.findByModuleId(moduleID)).map(c => c.contentID);
        for (const id of contentIDs) {
            if (!contents.map(c => c.contentID).includes(id)) {
                await updateContent({
                    moduleID: existingModule.moduleID,
                    contentID: id,
                    status: 'inactive'
                })
            };
        };

        // Try updating questions
        const updatedContents = [];
        try {
            for (const content of contents) {
                content.moduleID = moduleID;
                console.log(content);
                if (content.contentID) {
                    const updatedContent = await updateContent(content, client);
                    updatedContents.push(updatedContent);
                } else {
                    const newContent = await registerContent(content, client);
                    updatedContents.push(newContent);
                }
            }
        } catch(error) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: 'Error occured while updating content. ' + err
            });
        };

        // Prepare update data
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (moduleNumber !== undefined) updateData.moduleNumber = moduleNumber;
        if (expectedHours !== undefined) updateData.expectedHours = expectedHours;
        if (status !== undefined) updateData.status = moduleStatus;

        // Update module
        const updateModule = await Module.update(moduleID, updateData);

        await client.query('COMMIT');
        
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
                contents: updatedContents
            }
        });

    } catch(error) {
        await client.query('ROLLBACK');
        console.error('Update module error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

const getModule = async (req, res) => {
    try {
        const moduleID = req.params.moduleID;
        const module = await Module.findById(moduleID);
        if (!module) {
            return res.status(400).json({
                error: 'No module found.'
            });
        }

        const contents = await Content.findByModuleId(moduleID);
        module.contents = contents;

        res.json(module);
    } catch (error) {
        console.error('Get module error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

const getAll = async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const userId = req.headers['x-user-id'];
        let showingStatus = ['active'];

        // set showing status based on the user role
        // for example, students should be only allowed to see acive courses
        if (userId != undefined) {
            const user = await User.findById(userId);
            if (user && (user.role === 'course_owner' || user.role === 'admin')) {
                showingStatus = VALID_MODULE_STATUS;
            }
        }

        // Validate course ID
        if (!courseID) {
            return res.status(400).json({
                error: 'Course ID required.'
            });
        }

        // Check if course exists
        const course = await Course.findById(courseID, showingStatus);
        if (!course) {
            return res.status(404).json({
                error: 'Course not found.'
            });
        }

        const modules = await Module.findByCourseId(courseID, showingStatus);

        for (const module of modules) {
            let contents = await Content.findByModuleId(module.moduleID, showingStatus);
            module.contents = contents;
        }

        res.json(modules);
    } catch (error) {
        console.error('Get module error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getAllFromCourseOwner = async (req, res) => {
    try {
        const userID = req.params.userID;

        // Validate user ID
        if (!userID) {
            return res.status(400).json({
                error: 'User ID required.'
            });
        }

        // Check if user exists
        const user = await User.findById(userID);
        if (!user || user.role !== 'course_owner') {
            return res.status(404).json({
                error: 'Course owner not found.'
            });
        }

        const modules = await Module.findByCourseOwner(userID);
        
        for (const module of modules) {
            let contents = await Content.findByModuleId(module.moduleID);
            module.contents = contents;
        }

        res.json(modules);
    } catch (error) {
        console.error('Get module error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getMeta = (req, res) => {
    res.json({
        status: VALID_MODULE_STATUS,
    })
}

// Sync status with course status
const syncModuleStatus = async (courseID) => {
    try {
        const course = await Course.findById(courseID);
        if (!course) {
            throw new Error('Invalid course ID. Course not found.');
        }

        const modules = await Module.findByCourseId(courseID);
        if (modules.length > 0) {
            for (m of modules) {
                // if module status is inactive (deleted), do not change the status
                if (m.status === 'inactive') {
                    break;
                }

                // otherwise, sync the status with course
                const updated = await Module.update(m.moduleID, {
                    status: course.status
                })
                // Also, update content status
                syncContentStatus(m.moduleID);
            }
        }
    } catch (error) {
        throw new Error('Module status sync error: ' + error);
    }
}

module.exports = {
  register,
  update,
  getModule,
  getAll,
  syncModuleStatus,
  getAllFromCourseOwner,
  getMeta,
};