const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const { pool } = require('../config/database'); // Validate userID

// Issue certificate
const issue = async (req, res) => {
    try {
        const { userID, courseID, certificateURL } = req.body;

        if (!userID || !courseID || !certificateURL) {
            return res.status(400).json({ error: 'userID, courseID and certificateURL are required' });
        }

        // Validate user exists
        const userResult = await pool.query(`SELECT * FROM "User" WHERE "userID" = $1`, [userID]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        // Validate course exists
        const course = await Course.findById(courseID);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const newCert = await Certificate.create({ userID, courseID, certificateURL });
        res.json({ message: 'Certificate issued successfully', certificate: newCert });
    } catch (error) {
        console.error('Issue certificate error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get certificates by user
const getByUser = async (req, res) => {
    try {
        const userID = parseInt(req.params.userid);
        const certificates = await Certificate.findByUserId(userID);
        res.json({ certificates });
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get certificates by course
const getByCourse = async (req, res) => {
    try {
        const courseID = parseInt(req.params.courseid);
        const certificates = await Certificate.findByCourseId(courseID);
        res.json({ certificates });
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { issue, getByUser, getByCourse };
