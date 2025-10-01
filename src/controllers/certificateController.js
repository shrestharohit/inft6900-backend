const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const { pool } = require('../config/database');

// Issue certificate
const issue = async (req, res) => {
    try {
        const { userID, courseID, certificateURL, content } = req.body;

        if (!userID || !courseID || !certificateURL || !content) {
            return res.status(400).json({ error: 'userID, courseID, certificateURL, and content are required' });
        }

        // Validate user exists
        const userResult = await pool.query(`SELECT * FROM "User" WHERE "userID" = $1`, [userID]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        // Validate course exists
        const course = await Course.findById(courseID);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Create certificate with content
        const newCert = await Certificate.create({ userID, courseID, certificateURL, content });
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

// Update certificate
const update = async (req, res) => {
    try {
        const certificateID = parseInt(req.params.certificateid);
        const { content, certificateURL } = req.body;

        if (!certificateID) {
            return res.status(400).json({ error: 'certificateID is required' });
        }

        if (!content && !certificateURL) {
            return res.status(400).json({ error: 'At least one of content or certificateURL must be provided' });
        }

        // Update certificate
        const updatedCert = await Certificate.update(certificateID, { content, certificateURL });

        if (!updatedCert) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        res.json({ message: 'Certificate updated successfully', certificate: updatedCert });
    } catch (error) {
        console.error('Update certificate error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get certificate by ID
const getById = async (req, res) => {
    try {
        const certificateID = parseInt(req.params.certificateid);
        if (!certificateID) {
            return res.status(400).json({ error: 'certificateID is required in params' });
        }

        const certificate = await Certificate.findById(certificateID);
        if (!certificate) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        res.json({ certificate });
    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { issue, update, getByUser, getByCourse, getById };
