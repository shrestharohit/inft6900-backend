const express = require('express');
const router = express.Router();
const {
  createPost,
  replyPost,
  getPosts,
  getPostsByUser,
  updatePost,
  deletePost
} = require('../../controllers/discussionBoardController');

// Create new post
router.post('/:courseid/create', createPost);

// Reply to a post
router.post('/reply/:postid', replyPost);

// Get all posts for a course
router.get('/course/:courseid', getPosts);

// Get all posts by a user
router.get('/user/:userid', getPostsByUser);

// update a post or reply
router.put('/update/:postid', updatePost);

// Delete a post or reply
router.delete('/delete/:postid', deletePost);

module.exports = router;
