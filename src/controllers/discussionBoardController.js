const DiscussionBoard = require('../models/DiscussionBoard');
const Course = require('../models/Course');
const VALID_BOARD_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];

// Register a discussion board for a course
const registerBoard = async (req, res) => {
  try {
    const courseID = parseInt(req.params.courseid);
    const { title, status } = req.body;

    if (!courseID) {
      return res.status(400).json({ error: 'Course ID is required' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Validate course exists
    const course = await Course.findById(courseID);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Validate status
    if (status && !VALID_BOARD_STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid values: ${VALID_BOARD_STATUS.join(', ')}` });
    }

    const newBoard = await DiscussionBoard.create({ courseID, title, status });
    res.json({ message: 'Discussion board created successfully', board: newBoard });
  } catch (error) {
    console.error('Register board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update discussion board
const updateBoard = async (req, res) => {
  try {
    const boardID = parseInt(req.params.boardid);
    const { title, status } = req.body;

    const board = await DiscussionBoard.findById(boardID);
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (status && !VALID_BOARD_STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid values: ${VALID_BOARD_STATUS.join(', ')}` });
    }

    const updatedBoard = await DiscussionBoard.update(boardID, { title, status });
    res.json({ message: 'Discussion board updated successfully', board: updatedBoard });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all boards in a course
const getBoards = async (req, res) => {
  try {
    const courseID = parseInt(req.params.courseid);

    const course = await Course.findById(courseID);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const boards = await DiscussionBoard.findByCourse(courseID);
    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single board
const getBoard = async (req, res) => {
  try {
    const boardID = parseInt(req.params.boardid);
    const board = await DiscussionBoard.findById(boardID);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json({ board });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { registerBoard, updateBoard, getBoards, getBoard };
