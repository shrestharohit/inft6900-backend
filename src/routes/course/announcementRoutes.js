const express = require('express');
const {
  createAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  getAnnouncement
} = require('../../controllers/announcementController');

const router = express.Router({ mergeParams: true });

// Create announcement for a course
router.post('/', createAnnouncement);

// Update announcement
router.put('/:announcementid', updateAnnouncement);

// Get all announcements in a course
router.get('/', getAnnouncements);

// Get single announcement
router.get('/:announcementid', getAnnouncement);

module.exports = router;
