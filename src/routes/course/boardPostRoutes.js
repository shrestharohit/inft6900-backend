const express = require('express');
const {
  registerPost,
  updatePost,
  getPosts,
  getPost,
} = require('../../controllers/boardPostController');

const router = express.Router({ mergeParams: true });

// Create a post in a board inside a course
router.post('/:boardid/posts', registerPost);

// Update a post
router.put('/:boardid/posts/:postid', updatePost);

// Get all posts in a board
router.get('/:boardid/posts', getPosts);

// Get a single post
router.get('/:boardid/posts/:postid', getPost);

module.exports = router;
