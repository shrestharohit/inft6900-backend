const Enrolment = require('../models/Enrolment');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const CourseReview = require('../models/CourseReview');
const { pool } = require('../config/database');
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
        const [enrolments, reviews] = await Promise.all([
            Enrolment.findByCourses(courses.map(c => c.courseID)),
            CourseReview.findByCourses(courses.map(c => c.courseID))
        ])

        for (const course of courses) {
            // push course id & title
            let courseData = {};
            courseData.courseID = course.courseID;
            courseData.title = course.title;

            // push total enrolment
            const courseEnrolments = enrolments.filter(e => e.courseID === course.courseID)
            courseData.enrolments = enrolments.length;
            totalEnrolments += courseData.enrolments;

            // push avg ratings
            courseData.avgRating = 0.0;
            let avgRating = await CourseReview.getAvgRatings(course.courseID);
            if (avgRating) {
                courseData.avgRating = parseFloat(avgRating.AvgRating);
            }

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

        overallData.avgRating = 0.0;
        const courseOwnerRating = await CourseReview.getAvgCourseOwnerRatings(userID);
        if (courseOwnerRating) {
            overallData.avgRating = parseFloat(courseOwnerRating.AvgRating);
        }

        res.json({
            overallData: overallData,
            individualCourseData: allCourseData
        });

    } catch (error) {
        console.error('Get dashboard data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getAdminData = async (req, res) => {
    // total users
    const allUsers = await User.getAll();

    // new users
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() -7);

    const newUsers = allUsers.filter(user => user.created_at >= sevenDaysAgo);

    // each role
    const students = allUsers.filter(user => user.role === 'student');
    const courseOwners = allUsers.filter(user => user.role === 'course_owner');
    const admins = allUsers.filter(user => user.role === 'admin');

    // pending courses
    const pnedingCourses = await Course.findByStatus('wait_for_approval');
    const pendingQuizzes = await Quiz.getApprovalList();

    // total courses
    let allCourses = await Course.getAll();
    allCourses = allCourses.filter(c => c.status === 'active');

    // enrolment data
    const enrolments = [];
    for (const course of allCourses) {
        const courseEnrolments = await Enrolment.findByCourseId(course.courseID);
        enrolments.push({
            courseID: course.courseID,
            courseName: course.title,
            enrolledCount: courseEnrolments.filter(e => e.status === 'enrolled').length,
            inProgressCount: courseEnrolments.filter(e => e.status === 'in progress').length,
            completedCount: courseEnrolments.filter(e => e.status === 'completed').length,
            disenrolledCount: courseEnrolments.filter(e => e.status === 'disenrolld').length,
        })
    }

    const data = {
        totalUserCount: allUsers.length,
        newUserCount: newUsers.length,
        studentCount: students.length,
        courseOwnerCount: courseOwners.length,
        adminCount: admins.length,
        activeCourseCount: allCourses.length,
        pendingCourseCount: pnedingCourses.length,
        pendingQuizCount: pendingQuizzes.length,
        enrolments: enrolments,
        newUsers: newUsers
    }

    res.json(data);
}

module.exports = {
  getCourseOwnerData,
  getAdminData
};