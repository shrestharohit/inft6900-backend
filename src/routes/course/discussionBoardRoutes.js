const express = require('express');
const {
  registerBoard,
  updateBoard,
  getBoards,
  getBoard,
} = require('../../controllers/discussionBoardController');

const router = express.Router();

// Create board in a course
router.post('/:courseid/register', registerBoard);

// Update board
router.put('/update/:boardid', updateBoard);

// Get all boards in a course
router.get('/:courseid/getAll', getBoards);

// Get single board
router.get('/:boardid', getBoard);

module.exports = router;
