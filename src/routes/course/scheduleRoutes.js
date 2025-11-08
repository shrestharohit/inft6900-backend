const express = require('express');
const {
  createSchedule,
  updateSchedule,
  getSchedulesByModule,
  getSchedulesByUser,
  getSchedule,
  deleteSchedule
} = require('../../controllers/scheduleController');

const router = express.Router({ mergeParams: true });

// Create a schedule session
router.post('/create', createSchedule);

// Update a schedule session
router.put('/:scheduleid', updateSchedule);

// Get all schedules for a module (for a specific user)
router.get('/module/:moduleid/user/:userid', getSchedulesByModule);

// Get all schedules for a user
router.get('/user/:userid', getSchedulesByUser);

// Get a single schedule by ID
router.get('/:scheduleid', getSchedule);

// Delete a schedule
router.delete('/:scheduleid', deleteSchedule);

module.exports = router;
