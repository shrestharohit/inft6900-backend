const Course = require('../models/Course');
const Module = require('../models/Module');
const Content = require('../models/Content');
const User = require('../models/User');
const Pathway = require('../models/Pathway');
const { VALID_COURSE_STATUS, VALID_COURSE_LEVEL } = require('../config/constants');
const { sendApprovalRequestNotification, sendApprovalNotification, sendDeclineNotification } = require('../services/emailService');

const register = async (req, res) => {
    try {
        const { title, userID, pathwayID, category, level, outline, status } = req.body;

        // Basic validataion
        if (!title || !level || !status) {
            return res.status(400).json({
                error: 'Title, userID, level and status are required'
            });
        }

        // Validate owner id
        const existingUser = await User.findById(userID)
        if (!existingUser || existingUser.role !== 'course_owner') {
            return res.status(400).json({
                error: 'Invalid user ID. Course Owner does not exist.'
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

        // Validate pathway
        const pathway = await Pathway.findById(pathwayID)
        if (pathwayID != undefined && !pathway) {
            return res.status(400).json({
                error: 'Invalid pathway ID. Pathway not found.'
            });
        }

        // Check if there is already a course with the same level in the pathway
        const hasSameLevel = !!(await Course.findByPathwayIDCourseLevel(pathwayID, level));
        if (pathwayID != undefined && hasSameLevel) {
            return res.status(400).json({
                error: 'Pathway can have only 1 course in each level. Course with selected level already exists in pathway.'
            });
        }

        // Create course
        const newCourse = await Course.create({
            userID,
            title, 
            pathwayID,
            category,
            level: courseLevel, 
            outline, 
            status: courseStatus
        });

        res.json({
            message: 'Course registered successfully',
            course: newCourse
        })

    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const update = async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const { userID, title, pathwayID, category, level, outline, status } = req.body;

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

        const originalStatus = existingCourse.status;

        // Validate owner id
        const checkingUserID = userID || existingCourse.userID;
        const existingUser = await User.findById(checkingUserID);
        if (existingUser.role !== 'course_owner') {
            return res.status(400).json({
                error: 'Invalid user ID. Course Owner does not exist.'
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

        // Validate pathway
        const pathway = await Pathway.findById(pathwayID)
        if (pathwayID !== undefined && !pathway) {
            return res.status(400).json({
                error: 'Invalid pathway ID. Pathway not found.'
            });
        }

        // Check if there is already a course with the same level in the pathway
        const checkingPathwayID = pathwayID || existingCourse.pathwayID;
        const checkingLevel = level || existingCourse.level;

        const hasSameLevel = !!(await Course.findByPathwayIDCourseLevel(checkingPathwayID, checkingLevel));
        if (checkingPathwayID !== undefined && hasSameLevel) {
            return res.status(400).json({
                error: 'Pathway can have only 1 course in each level. Course with selected level already exists in pathway.'
            });
        }
       

        // Prepare update data
        const updateData = {};
        if (userID !== undefined) updateData.userID = userID;
        if (title !== undefined) updateData.title = title;
        if (category !== undefined) updateData.category = category;
        if (level !== undefined) updateData.level = courseLevel;
        if (outline !== undefined) updateData.outline = outline;
        if (status !== undefined) updateData.status = courseStatus;

        // Create course
        const updateCourse = await Course.update(courseID, updateData)

        // Send notification in case of status change
        if (originalStatus !== updateData.status && originalStatus !== 'active') {
          sendNotification(updateCourse.courseID);
        }

        res.json({
            message: 'Course updated successfully',
            course: {
                courseID: updateCourse.courseID,
                userID: updateCourse.userID,
                pathwayID: updateCourse.pathwayID,
                title: updateCourse.title,
                category: updateCourse.category,
                level: updateCourse.level,
                outline: updateCourse.outline,
                status: updateCourse.status,
                updated_at: updateCourse.updated_at
            }
        })

    } catch(error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getAllCategories = async (req, res) => {
    const categories = (await Course.getAllCategories()).map(row=>row.category);
    res.json(categories);
}


const getAll = async (req, res) => {
    const courses = await Course.getAll();

    const processedData = [];

    // get modules and contents nested
    for (const course of courses) {
      let modules = await Module.findByCourseId(course.courseID);
      let processedCourse = course;

      const processedModules = [];
      for (const module of modules) {
        let contents = await Content.findByModuleId(module.moduleID);
        let processedModule = module;
        processedModule.contents = contents;
        processedModules.push(processedModule)
      }

      processedCourse.modules = processedModules;

      processedData.push(processedCourse);
    }

    res.json(processedData);
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

    // Find course by ID
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

const getUserCourses = async (req, res) => {
  try {
    const userID = req.params.userID;

    // Validate course id is provided
    if (!userID) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Find course by ID
    const courses = await Course.findByOwner(userID);
    res.json(courses);

  } catch (error) {
    console.error('Get course by owner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getApprovalList = async (req, res) => {
  try {
    // Find course by ID
    const course = await Course.findByStatus("wait_for_approval");
    res.json(course);
  } catch (error) {
    console.error('Get wait for approval courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDetail = async (req, res) => {
  try {
    const courseID = req.params.courseID;

    if (!courseID){
      return res.status(400).json({ 
        error: 'Course ID is required' 
      });
    }

    // Find course by ID
    const course = await Course.findById(courseID);
    
    // find modules in the quiz
    const modules = await Module.findByCourseId(course.courseID);

    // get course owner data
    const user = await User.findById(course.userID);

    // get pathway data
    let pathway = null;
    if (course.pathway !== null) {
        pathway = await Pathway.findById(course.pathwayID);
    }

    const result = {
        courseID: course.courseID,
        userID: course.userID,
        pathwayID: course.pathwayID,
        title: course.title,
        category: course.category,
        level: course.level,
        outline: course.outline,
        status: course.status,
        created_at: course.updated_at,
        updated_at: course.updated_at,
        userDetail: user,
        modules: modules,
        pathwayDetail: pathway
    }
    res.json(result);
  } catch (error) {
    console.error('Get wait for approval courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const sendNotification = async (courseID) => {
    const course = await Course.findById(courseID);
    const user = await User.findById(course.userID);

    const requestingItem = {
      'type': 'Course',
      'name': course.title
    }

    if (course.status === 'wait_for_approval') {
      sendApprovalRequestNotification(user, requestingItem)
    }

    if (course.status === 'active') {
      sendApprovalNotification(user, requestingItem)
    }

    if (course.status === 'draft') {
      sendDeclineNotification(user, requestingItem)
    }

}

module.exports = {
  register,
  update,
  getAllCategories,
  getAll,
  getMeta,
  getCourse,
  getUserCourses,
  getApprovalList,
  getDetail
};