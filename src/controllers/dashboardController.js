const Enrolment = require('../models/Enrolment');
const User = require('../models/User');
const Course = require('../models/Course');
const CourseReview = require('../models/CourseReview');
const { VALID_MODULE_STATUS } = require('../config/constants');
const { pool } = require('../config/database');
const { registerContent, updateContent } = require('../controllers/contentController');
const Announcement = require('../models/Announcement');

const getCourseOwnerData = async (req, res) => {
    try {
        const userID = req.params.userID;
        if (!userID) {
            return res.status(400).json({ 
                    error: 'User ID is required' 
                });
        }

        const user = await User.findById(userID);

        if (!user || user.role !== 'course_owner') {
            return res.status(400).json({ 
                    error: 'Course Owner not found' 
                });
        }

        const allCourseData = [];
        let totalEnrolments = 0;

        // Get individual course data
        const courses = await Course.findByOwner(userID);
        for (const course of courses) {
            // push course id & title
            let courseData = {};
            course.courseID = course.courseID;
            courseData.title = course.title;

            // push total enrolment
            let enrolments = await Enrolment.findByCourseId(course.courseID);
            courseData.enrolments = enrolments.length;
            totalEnrolments += courseData.enrolments;

            // push avg ratings
            let avgRating = await CourseReview.getAvgRatings(course.courseID);
            courseData.avgRating = avgRating;

            // push released date (created_at is fine...?)
            courseData.releasedDate = course.created_at;

            allCourseData.push(courseData);
        }

        // Get overall summarised data
        const overallData = {};
        
        const coursesOwned = courses.length;
        overallData.coursesOwned = coursesOwned;

        overallData.enrolments = totalEnrolments;

        const announcements = await Announcement.findByCourseOwner(userID, ['active']);
        overallData.totalPublishedAnnouncement = announcements.length;

        const courseOwnerRating = await CourseReview.getAvgCourseOwnerRatings(userID);
        overallData.avgRating = courseOwnerRating;

        res.json({
            overallData: overallData,
            individualCourseData: allCourseData
        });

    } catch (error) {
        console.error('Get dashboard data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports = {
  getCourseOwnerData
};