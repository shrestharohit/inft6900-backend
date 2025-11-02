const DiscussionBoard = require('../models/DiscussionBoard');
const User = require('../models/User');
const Course = require('../models/Course');
const { sendPostReplyNotification } = require('../services/emailService');


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

    const newPost = await DiscussionBoard.create({ courseID, userID, title, postText });
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

    const parentPost = await DiscussionBoard.findById(parentPostID);
    if (!parentPost) return res.status(404).json({ error: 'Parent post not found' });

    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Auto-generate title if missing
    const replyTitle = title || `Re: ${parentPost.title}`;

    const newReply = await DiscussionBoard.create({
      courseID: parentPost.courseID,
      userID,
      title: replyTitle,
      postText,
      parentPostID
    });

    // Send Email Notification to Original Poster
    try {
      const originalPost = await db.query(`
        SELECT p."postID", p."title", p."content", p."courseID",
               u."email", u."firstName", COALESCE(n."notificationEnabled", true) AS "notificationEnabled"
        FROM "tblDiscussionPost" p
        JOIN "tblUser" u ON p."userID" = u."userID"
        LEFT JOIN "tblNotificationSetting" n ON u."userID" = n."userID"
        WHERE p."postID" = $1
      `, [parentPostID]);

      if (originalPost.rows.length > 0) {
        const postOwner = originalPost.rows[0];

        // ✅ Only send if notifications are enabled
        if (postOwner.notificationEnabled) {
          await sendPostReplyNotification(postOwner, {
            courseName: "Course Name Here", // optionally fetch real course name
            postTitle: postOwner.title,
            replyContent: newReply.postText
          });
          console.log(`✅ Reply notification sent to ${postOwner.email}`);
        }
      }
    } catch (err) {
      console.error("❌ Failed to send reply notification:", err.message);
    }
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
    const posts = await DiscussionBoard.findByCourse(courseID);

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

// Get posts by user
const getPostsByUser = async (req, res) => {
  try {
    const userID = parseInt(req.params.userid);
    const posts = await DiscussionBoard.findByUser(userID);
    res.json({ posts });
  } catch (error) {
    console.error('Get posts by user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const postID = parseInt(req.params.postid);
    const { title, postText } = req.body;

    const post = await DiscussionBoard.findById(postID);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const updated = await DiscussionBoard.update(postID, { title, postText });
    res.json({ message: 'Post updated', post: updated });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const postID = parseInt(req.params.postid);
    const post = await DiscussionBoard.findById(postID);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await DiscussionBoard.delete(postID);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createPost, replyPost, getPosts, getPostsByUser, updatePost, deletePost };
