const Announcement = require('../models/Announcement');
const Course = require('../models/Course');


const createAnnouncement = async (req, res) => {
  try {
    const courseID = parseInt(req.params.courseid);
    const { title, content, status } = req.body;

    const course = await Course.findById(courseID);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // validate status
    const VALID_ANNOUNCEMENT_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
    if (status && !VALID_ANNOUNCEMENT_STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed values: ${VALID_ANNOUNCEMENT_STATUS.join(', ')}` });
    }

    const newAnnouncement = await Announcement.create({ courseID, title, content, status });
    res.json({ message: 'Announcement created', announcement: newAnnouncement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcementID = parseInt(req.params.announcementid);
    const { title, content, status } = req.body;

    const existing = await Announcement.findById(announcementID);
    if (!existing) return res.status(404).json({ error: 'Announcement not found' });
    
    // validate status
    const VALID_ANNOUNCEMENT_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
    if (status && !VALID_ANNOUNCEMENT_STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed values: ${VALID_ANNOUNCEMENT_STATUS.join(', ')}` });
    }

    const updated = await Announcement.update(announcementID, { title, content, status });
    res.json({ message: 'Announcement updated', announcement: updated });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const courseID = parseInt(req.params.courseid);
    const announcements = await Announcement.findByCourse(courseID);
    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAnnouncement = async (req, res) => {
  try {
    const announcementID = parseInt(req.params.announcementid);
    const announcement = await Announcement.findById(announcementID);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ announcement });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createAnnouncement, updateAnnouncement, getAnnouncements, getAnnouncement };
