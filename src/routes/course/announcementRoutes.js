const express = require('express');
const {
  createAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  getAnnouncement,
  deleteAnnouncement
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

// Delete an announcement
router.delete('/delete/:announcementid', deleteAnnouncement);

module.exports = router;
