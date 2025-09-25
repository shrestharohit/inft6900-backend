const express = require('express');
const {
  registerBoard,
  updateBoard,
  getBoards,
  getBoard,
} = require('../../../controllers/discussionBoardController');

const router = express.Router();

// Create board in a course
router.post('/:courseid/boards', registerBoard);

// Update board
router.put('/:courseid/boards/:boardid', updateBoard);

// Get all boards in a course
router.get('/:courseid/boards', getBoards);

// Get single board
router.get('/:courseid/boards/:boardid', getBoard);

module.exports = router;
