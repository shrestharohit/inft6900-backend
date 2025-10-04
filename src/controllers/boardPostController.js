const BoardPost = require('../models/BoardPost');
const DiscussionBoard = require('../models/DiscussionBoard');
const User = require('../models/User'); 

// Register a post in a discussion board
const registerPost = async (req, res) => {
  try {
    const boardID = parseInt(req.params.boardid);
    const { userID, title, postText, status } = req.body; 

    if (!boardID || !userID || !postText || !title) {
      return res.status(400).json({ error: 'Board ID, user ID, title, and post text are required' });
    }

    // Validate status
    const VALID_BOARD_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
    if (status && !VALID_BOARD_STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid values: ${VALID_BOARD_STATUS.join(', ')}` });
    }

    // Validate board exists
    const board = await DiscussionBoard.findById(boardID);
    if (!board) return res.status(404).json({ error: 'Discussion board not found' });

    // Validate user exists
    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newPost = await BoardPost.create({ boardID, userID, title, postText, status });
    res.json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Register post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const postID = parseInt(req.params.postid);
    const { title, postText, status } = req.body;

    const existingPost = await BoardPost.findById(postID);
    if (!existingPost) return res.status(404).json({ error: 'Post not found' });

    // Validate status
    const VALID_BOARD_STATUS = ['draft', 'wait_for_approval', 'active', 'inactive'];
    if (status && !VALID_BOARD_STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid values: ${VALID_BOARD_STATUS.join(', ')}` });
    }

    const updatedPost = await BoardPost.update(postID, { title, postText, status });
    res.json({ message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts in a board
const getPosts = async (req, res) => {
  try {
    const boardID = parseInt(req.params.boardid);

    const board = await DiscussionBoard.findById(boardID);
    if (!board) return res.status(404).json({ error: 'Discussion board not found' });

    const posts = await BoardPost.findByBoard(boardID);
    res.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single post
const getPost = async (req, res) => {
  try {
    const postID = parseInt(req.params.postid);
    const post = await BoardPost.findById(postID);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { registerPost, updatePost, getPosts, getPost };
