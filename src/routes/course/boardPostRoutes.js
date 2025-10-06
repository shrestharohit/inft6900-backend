const express = require('express');
const {
  registerPost,
  updatePost,
  getPosts,
  getPost,
  deletePost,
} = require('../../controllers/boardPostController');

const router = express.Router({ mergeParams: true });

// Create a post in a board inside a course
router.post('/:boardid/register', registerPost);

// Update a post
router.put('/update/:postid', updatePost);

// Get all posts in a board
router.get('/:boardid/getAll', getPosts);

// Get a single post
router.get('/:postid', getPost);

// Delete a post
router.delete('/delete/:postid', deletePost);

module.exports = router;
