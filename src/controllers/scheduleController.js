const Schedule = require('../models/Schedule');
const Module = require('../models/Module');
const User = require('../models/User');
const Course = require('../models/Course');

// Create a study schedule
const createSchedule = async (req, res) => {
  try {
    const { moduleID, userID, date, startTime, endTime } = req.body;

    // Validate user
    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate module
    const module = await Module.findById(moduleID);
    if (!module) return res.status(404).json({ error: 'Module not found' });

    // Create new schedule
    const newSchedule = await Schedule.create({
      moduleID,
      userID,
      date,
      startTime,
      endTime
    });

    res.json({ message: 'Schedule created successfully', schedule: newSchedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a schedule session
const updateSchedule = async (req, res) => {
  try {
    const scheduleID = parseInt(req.params.scheduleid);
    const { date, startTime, endTime } = req.body;

    const existing = await Schedule.findById(scheduleID);
    if (!existing) return res.status(404).json({ error: 'Schedule not found' });

    const updated = await Schedule.update(scheduleID, { date, startTime, endTime });
    res.json({ message: 'Schedule updated successfully', schedule: updated });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all schedules for a module (for a user)
const getSchedulesByModule = async (req, res) => {
  try {
    const userID = parseInt(req.params.userid);
    const moduleID = parseInt(req.params.moduleid);

    const schedules = await Schedule.findByUser(userID, moduleID);
    if (!schedules || schedules.length === 0)
      return res.status(404).json({ error: 'No schedules found for this module.' });

    res.json({
      message: 'Schedules retrieved successfully',
      userID,
      moduleID,
      totalSessions: schedules.length,
      schedules
    });
  } catch (error) {
    console.error('Get schedules by module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all schedules for a user (across all modules)
const getSchedulesByUser = async (req, res) => {
  try {
    const userID = parseInt(req.params.userid);
    const schedules = await Schedule.findByUser(userID);
    if (!schedules || schedules.length === 0)
      return res.status(404).json({ error: 'No schedules found for this user.' });

    res.json({ message: 'User schedules retrieved successfully', schedules });
  } catch (error) {
    console.error('Get schedules by user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single schedule by ID
const getSchedule = async (req, res) => {
  try {
    const scheduleID = parseInt(req.params.scheduleid);
    const schedule = await Schedule.findById(scheduleID);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    res.json({ message: 'Schedule retrieved successfully', schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a schedule session
const deleteSchedule = async (req, res) => {
  try {
    const scheduleID = parseInt(req.params.scheduleid);
    const existing = await Schedule.findById(scheduleID);
    if (!existing) return res.status(404).json({ error: 'Schedule not found' });

    await Schedule.delete(scheduleID);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createSchedule,
  updateSchedule,
  getSchedulesByModule,
  getSchedulesByUser,
  getSchedule,
  deleteSchedule
};
