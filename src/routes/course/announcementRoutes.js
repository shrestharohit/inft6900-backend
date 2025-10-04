const express = require('express');
const {
  createAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  getAnnouncement
} = require('../../controllers/announcementController');

const router = express.Router({ mergeParams: true });

// Create announcement for a course
router.post('/:courseid/register', createAnnouncement);

// Update announcement
router.put('/update/:announcementid', updateAnnouncement);

// Get all announcements in a course
router.get('/:courseid/getAll', getAnnouncements);

// Get single announcement
router.get('/:announcementid', getAnnouncement);

module.exports = router;
