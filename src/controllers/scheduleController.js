const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Module = require('../models/Module');
const User = require('../models/User');

const createSchedule = async (req, res) => {
  try {
    const courseID = parseInt(req.params.courseid);
    const { moduleID, userID, scheduledDateTime, status } = req.body;

    // Validate course, module, user
    const course = await Course.findById(courseID);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const module = await Module.findById(moduleID);
    if (!module || module.courseID !== courseID)
      return res.status(404).json({ error: 'Module not found in this course' });

    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newSchedule = await Schedule.create({ courseID, moduleID, userID, scheduledDateTime, status });
    res.json({ message: 'Schedule created', schedule: newSchedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const scheduleID = parseInt(req.params.scheduleid);
    const { scheduledDateTime, status } = req.body;

    const existing = await Schedule.findById(scheduleID);
    if (!existing) return res.status(404).json({ error: 'Schedule not found' });

    const updated = await Schedule.update(scheduleID, { scheduledDateTime, status });
    res.json({ message: 'Schedule updated', schedule: updated });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSchedulesByCourse = async (req, res) => {
  try {
    const courseID = parseInt(req.params.courseid);
    const schedules = await Schedule.findByCourse(courseID);
    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSchedulesByUser = async (req, res) => {
  try {
    const userID = parseInt(req.params.userid);
    const schedules = await Schedule.findByUser(userID);
    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSchedule = async (req, res) => {
  try {
    const scheduleID = parseInt(req.params.scheduleid);
    const schedule = await Schedule.findById(scheduleID);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createSchedule, updateSchedule, getSchedulesByCourse, getSchedulesByUser, getSchedule };
