const Enrolment = require('../models/Enrolment');
const User = require('../models/User');
const Course = require('../models/Course');
// const Pathway = require('../models/Pathway');
const { VALID_ENROLMENT_STATUS } = require('../config/constants');

const enrolCourse = async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const { pathwayID, studentID } = req.body;

        // Validate course id is provided
        if (!courseID) {
            return res.status(400).json({ 
                error: 'Course ID is required in header (courseID) or query parameter (courseID)' 
            });
        };

        // Basic validataion
        if (!studentID) {
            return res.status(400).json({
                error: 'Student ID is required'
            });
        };

        // Validate course ID
        const enrolledCourse = await Course.findById(courseID)
        if (!enrolledCourse) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        };

        // Validate student ID
        const enrolledStudent = await User.findById(studentID)
        if (!enrolledStudent || enrolledStudent.role !== 'student') {
            return res.status(400).json({
                error: 'Invalid student ID. Student does not exist.'
            });
        };

        // Validate pathway ID
        // if (pathwayID) {
        //     const enrolledPathway = await Pathway.findById(pathwayID);
        //     if (!enrolledPathway) {
        //         return res.status(400).json({
        //             error: 'Invalid pathway ID. Pathway does not exist.'
        //         });
        //     }

        //     const courses = await Course.findByPathwayId(pathwayID);
        //     if (!courses.includes(enrolledCourse)) {
        //         return res.status(400).json({
        //             error: 'Invalid pathway ID for course. Selected pathway does not have the selected course.'
        //         });
        //     }
        // }

        // Check if the student has already enrolled the course
        const existingEnrolment = await Enrolment.findByCourseIdStudentId(courseID, studentID);
        if (existingEnrolment && existingEnrolment.status !== 'disenrolled') {
            return res.status(400).json({
                error: 'Student already enrolled the selected course.'
            });
        }

        // if (existingEnrolment && existingEnrolment == 'disenrolled') {

        // }

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

const getAll = async (req, res) => {
    const enrolments = await Enrolment.getAll();
    res.json(enrolments);
}


const getMeta = (req, res) => {
    res.json({
        status: VALID_ENROLMENT_STATUS,
    })
}


module.exports = {
  enrolCourse,
  disenrolCourse,
  updateCourseEnrolment,
//   enrolPathway,
//   disenrolPathway,
//   updatePathwayEnrolment,
  getStudentEnrolment,
  getAll,
  getMeta,
};