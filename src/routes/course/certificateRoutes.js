const express = require('express');
const { issue, update, getByUser, getByCourse, getById } = require('../../controllers/certificateController');
const router = express.Router();

// Issue a new certificate
router.post('/', issue);

// Update an existing certificate
router.put('/:certificateid', update);

// Get certificates by user
router.get('/user/:userid', getByUser);

// Get certificates by course
router.get('/course/:courseid', getByCourse);

// Get certificate by ID
router.get('/:certificateid', getById);

module.exports = router;
