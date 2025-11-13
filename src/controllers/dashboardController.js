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

        // return empty data if no course
        if (!courses || courses.length === 0) {
            return res.json({
                overallData: {
                coursesOwned: 0,
                enrolments: 0,
                totalPublishedAnnouncement: 0,
                avgRating: 0.0,
                },
                individualCourseData: [],
            });
        }

        const [enrolments, reviews, announcements, courseOwnerRating] = await Promise.all([
            Enrolment.findByCourses(courses.map(c => c.courseID)),
            CourseReview.findByCourses(courses.map(c => c.courseID)),
            Announcement.findByCourseOwner(userID, ['active']),
            CourseReview.getAvgCourseOwnerRatings(userID)
        ])


        for (const course of courses) {
            // push course id & title
            const courseData = {};
            courseData.courseID = course.courseID;
            courseData.title = course.title;

            // push total enrolment
            const courseEnrolments = enrolments.filter(e => e.courseID === course.courseID);
            courseData.enrolments = courseEnrolments.length;
            totalEnrolments += courseData.enrolments;

            // push avg ratings
            courseData.avgRating = 0.0;
            const courseReviews = reviews.filter(r => r.courseID === course.courseID);
            let avgRating = 0.0;
            if (courseReviews.length !== 0) {
                avgRating = courseReviews.reduce((total, next) => total + next.rating, 0) / courseReviews.length
            }
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

        overallData.totalPublishedAnnouncement = announcements.length;

        overallData.avgRating = parseFloat(courseOwnerRating?.AvgRating || 0.0);
        
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