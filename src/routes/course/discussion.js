const express = require('express');
const {
  createPost,
  replyPost,
  getPosts,
  updatePost,
  deletePost,
  getPostsByUser
} = require('../../controllers/discussionController');

const router = express.Router({ mergeParams: true });

// Top-level post
router.post('/:courseid/create', createPost);

// Reply to a post
router.post('/:postid/reply', replyPost);

// Get all posts (with nested replies)
router.get('/:courseid/all', getPosts);

// Update post/reply
router.put('/:postid/update', updatePost);

// Delete post/reply
router.delete('/:postid/delete', deletePost);

// Get all posts by a specific user
router.get('/user/:userid', getPostsByUser);

module.exports = router;
