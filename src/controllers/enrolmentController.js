const Enrolment = require('../models/Enrolment');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Pathway = require('../models/Pathway');
const { VALID_ENROLMENT_STATUS } = require('../config/constants');

const enrolCourse = async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const { userID } = req.body;
        let pathwayID = null;

        // Validate course id is provided
        if (!courseID) {
            return res.status(400).json({ 
                error: 'Course ID is required in header (courseID) or query parameter (courseID)' 
            });
        };

        // Basic validataion
        if (!userID) {
            return res.status(400).json({
                error: 'User ID is required'
            });
        };

        // Validate course ID
        const enrolledCourse = await Course.findById(courseID)
        if (!enrolledCourse) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        };

        // Validate user ID
        const enrolledUser = await User.findById(userID)
        if (!enrolledUser || enrolledUser.role !== 'student') {
            return res.status(400).json({
                error: 'Invalid user ID. Student user does not exist.'
            });
        };

        // Check if the user is doing pathway or single course
        const isPathway = await isPathwayEnrolled(userID, courseID);
        if (isPathway) {
            pathwayID = enrolledCourse.pathwayID;
        };

        // If user is taking a pathway, validate pre-requisite
        const passedPrerequisite = await valdiatePrerequisite(userID, pathwayID, enrolledCourse.courseID)
        if (!passedPrerequisite) {
            return res.status(400).json({
                error: 'Invalid enrolment. User does not meet pre-requisite for this course.'
            })
        };

        // Check if the student has already enrolled the course
        const existingEnrolment = await Enrolment.findByCourseIdUserID(courseID, userID);
        if (existingEnrolment && existingEnrolment.status !== 'disenrolled') {
            return res.status(400).json({
                error: 'User already enrolled the selected course.'
            });
        };

        // Re-enrol the course if status is disenrolled
        let newEnrolment = null;
        if (existingEnrolment && existingEnrolment.status == 'disenrolled') {
            newEnrolment = await Enrolment.update(existingEnrolment.enrolmentID, {status: 'enrolled'})
        } 
        // otherwise, create new enrolment data
        else {
            newEnrolment = await Enrolment.create({
                pathwayID,
                courseID,
                userID,
            });
        }

        res.json({
            message: 'Enrolment registered successfully',
            enrolment: {
                enrolDate: newEnrolment.enrolDate,
                enrolmentID: newEnrolment.moduleID,
                pathwayID: newEnrolment.pathwayID,
                courseID: newEnrolment.courseID,
                userID: newEnrolment.userID,
                status: newEnrolment.status
            }
        })

    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const disenrolCourse = async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const { userID } = req.body;

        // Validate course id is provided
        if (!courseID) {
            return res.status(400).json({ 
                error: 'Course ID is required in header (courseID) or query parameter (courseID)' 
            });
        };

        // Basic validataion
        if (!userID) {
            return res.status(400).json({
                error: 'User ID is required'
            });
        };

        // Validate course ID
        const enrolledCourse = await Course.findById(courseID)
        if (!enrolledCourse) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        };

        // Validate user ID
        const enrolledUser = await User.findById(userID)
        if (!enrolledUser || enrolledUser.role !== 'student') {
            return res.status(400).json({
                error: 'Invalid user ID. Student user does not exist.'
            });
        };

        // Check if the student has already enrolled the course
        const existingEnrolment = await Enrolment.findByCourseIdUserID(courseID, userID);
        if (!existingEnrolment || existingEnrolment.status == 'disenrolled') {
            return res.status(400).json({
                error: 'User not enrolled the selected course.'
            });
        };

        // disenrol the course
        const dienrolment = await Enrolment.update(existingEnrolment.enrolmentID, {status: 'disenrolled'});

        res.json({
            message: 'Disecnrolment registered successfully',
            enrolment: {
                enrolDate: dienrolment.enrolDate,
                enrolmentID: dienrolment.enrolmentID,
                pathwayID: dienrolment.pathwayID,
                courseID: dienrolment.courseID,
                userID: dienrolment.userID,
                status: dienrolment.status,
                disenrolledDate: dienrolment.disenrolledDate
            }
        })

    } catch(error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getCourseEnrolment = async (req, res) => {
    try {
        const courseID = req.params.courseID;

        // Validate course id is provided
        if (!courseID) {
            return res.status(400).json({ 
                error: 'Course ID is required in header (courseID)' 
            });
        };

        // Validate course ID
        const course = await Course.findById(courseID)
        if (!course) {
            return res.status(400).json({
                error: 'Invalid course ID. Course does not exist.'
            });
        };

        // Get all enrolments for the course
        const enrolments = await Enrolment.findByCourseId(courseID);

        res.json({
            enrolments
        });

    } catch(error) {
        console.error('Get enrolements errors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getUserEnrolment = async (req, res) => {
    try {
        const userID = req.params.userID;

        // Validate course id is provided
        if (!userID) {
            return res.status(400).json({ 
                error: 'User ID is required in header (userID)' 
            });
        };

        // Validate user ID
        const user = await User.findById(userID)
        if (!user || user.role !== 'student') {
            return res.status(400).json({
                error: 'Invalid user ID. Student user does not exist.'
            });
        };

        // Get all enrolment made by users
        const enrolments = await Enrolment.findByUserID(userID);

        res.json({
            enrolments
        })

    } catch(error) {
        console.error('Get course errors error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const refreshStatus = async (enrolmentID) => {
    try {
        // Validate enrolment
        const enrolment = await Enrolment.findById(enrolmentID);
        if (!enrolment) {
            throw new Error('Enrolment not found');
        }

        let updatedEnrolment = enrolment;

        // switch to in progress if the first quiz is passed
        if (enrolment.status === 'enrolled') {
            updatedEnrolment = await Enrolment.update(enrolmentID, {status: 'in progress'});
        }

        // switch to completed if all quizzes are passed
        quizzes = await Quiz.findByCourseID(enrolment.courseID);
        let completed = false;
        for (let quiz of quizzes) {
            if (!quiz.passed) {
                completed = false;
                break;
            } else {
                completed = true;
            }
        }

        if (completed) {
            updatedEnrolment = await Enrolment.update(enrolmentID, {status: 'completed'});
        }
        return updatedEnrolment;

    } catch(error) {
        throw new Error(`Refresh enrolment status error: ${error}`);
    }
}

const getPopular = async (req, res) => {
    const popularCourses = await Enrolment.getPopularCourses();
    const popularPathways = await Enrolment.getPopularPathways();
    result = {
        popularCourses: popularCourses,
        popularPathways: popularPathways
    }
    res.json(result);
}

const getAll = async (req, res) => {
    const enrolments = await Enrolment.getAll();
    res.json(enrolments);
}


const getMeta = (req, res) => {
    res.json({
        status: VALID_ENROLMENT_STATUS,
    })
}


// Get user's current level in the pathway
const getUserLevel = async (userID, pathwayID) => {
    const levels = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3,
    }
 
    let level = 1;
    const enrolledCourses = await Enrolment.findByPathwayIdUserID(pathwayID, userID);

    for (const course of enrolledCourses) {
        if (course.status === "completed" && levels[course.level] > level) {
            level = levels[course.level];
        }
    }
    return level;
}


// Check if the user is enrolling pathway for the course or not
const isPathwayEnrolled = async (userID, courseID) => {
    // get all pathways user is taking
    const pathwaysQuery = await Enrolment.getUserEnrolledPathways(userID);
    const pathways = pathwaysQuery.map(row => row.pathwayID).filter(id => id !== null);
    const enrolledCourse = await Course.findById(courseID);

    // if user is not taking pathway of the enrolled course, then always true
    if (pathways.includes(enrolledCourse.pathwayID)) {
        return true;
    } else {
        return false;
    }
}

// Validate if the user satisfies pre-requisite for pathway or not
const valdiatePrerequisite = async (userID, pathwayID, courseID) => {
    const levels = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3,
    }

    // if enrolled course does not have pathway, then always true
    if (!pathwayID) {
        return true;
    }

    // if user is not taking pathway of the enrolled course, then always true
    if (!isPathwayEnrolled(userID, courseID)) {
        return true;
    }

    // if user has completed a course higher level than the enrolled course, then alwasy true
    const userLevel = await getUserLevel(userID, pathwayID);
    const enrolledCourse = await Course.findById(courseID)
    console.log(enrolledCourse.level)
    if (userLevel > levels[enrolledCourse.level]) {
        return true;
    }

    return false;
}


module.exports = {
    enrolCourse,
    disenrolCourse,
    getCourseEnrolment,
    refreshStatus,
    // enrolPathway,
    // disenrolPathway,
    // updatePathwayEnrolment,
    getPopular,
    getUserEnrolment,
    getAll,
    getMeta
};