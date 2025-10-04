const Discussion = require('../models/Discussion');
const User = require('../models/User');
const Course = require('../models/Course');

// Create a top-level post
const createPost = async (req, res) => {
  try {
    const courseID = parseInt(req.params.courseid);
    const { userID, title, postText } = req.body;

    if (!courseID || !userID || !title || !postText)
      return res.status(400).json({ error: 'Course, user, title, and content are required' });

    const course = await Course.findById(courseID);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newPost = await Discussion.create({ courseID, userID, title, postText });
    res.json({ message: 'Post created', post: newPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reply to a post
const replyPost = async (req, res) => {
  try {
    const parentPostID = parseInt(req.params.postid);
    const { userID, title, postText } = req.body;

    const parentPost = await Discussion.findById(parentPostID);
    if (!parentPost) return res.status(404).json({ error: 'Parent post not found' });

    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newReply = await Discussion.create({
      courseID: parentPost.courseID,
      userID,
      title,
      postText,
      parentPostID
    });
    res.json({ message: 'Reply created', post: newReply });
  } catch (error) {
    console.error('Reply post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts + replies for a course
const getPosts = async (req, res) => {
  try {
    const courseID = parseInt(req.params.courseid);
    const posts = await Discussion.findByCourse(courseID);

    const topLevelPosts = posts.filter(p => !p.parentPostID);
    topLevelPosts.forEach(post => {
      post.replies = posts.filter(p => p.parentPostID === post.postID);
    });

    res.json({ posts: topLevelPosts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update post or reply
const updatePost = async (req, res) => {
  try {
    const postID = parseInt(req.params.postid);
    const { title, postText } = req.body;

    const post = await Discussion.findById(postID);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const updated = await Discussion.update(postID, { title, postText });
    res.json({ message: 'Post updated', post: updated });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete post or reply
const deletePost = async (req, res) => {
  try {
    const postID = parseInt(req.params.postid);
    const post = await Discussion.findById(postID);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await Discussion.delete(postID);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts by a specific user
const getPostsByUser = async (req, res) => {
  try {
    const userID = parseInt(req.params.userid);
    const posts = await Discussion.findByUser(userID);
    res.json({ posts });
  } catch (error) {
    console.error('Get posts by user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createPost, replyPost, getPosts, updatePost, deletePost, getPostsByUser };
