const express = require('express');
const {
  createSchedule,
  updateSchedule,
  getSchedulesByCourse,
  getSchedulesByUser,
  getSchedule
} = require('../../controllers/scheduleController');

const router = express.Router({ mergeParams: true });

// Create schedule for a course
router.post('/', createSchedule);

// Update schedule
router.put('/:scheduleid', updateSchedule);

// Get all schedules in a course
router.get('/', getSchedulesByCourse);

// Get schedule by ID
router.get('/:scheduleid', getSchedule);

// Optional: Get schedules by user
router.get('/user/:userid', getSchedulesByUser);

module.exports = router;
