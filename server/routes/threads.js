const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/threads - Get threads with pagination and sorting
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const sortBy = req.query.sortBy || 'date';
    const skip = (page - 1) * limit;

    let sortOptions = {};
    switch (sortBy) {
      case 'likes':
        sortOptions = { likesCount: -1, createdAt: -1 };
        break;
      case 'comments':
        sortOptions = { commentsCount: -1, createdAt: -1 };
        break;
      case 'date':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const threads = await Thread.find()
      .populate('creator', 'name email role profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalThreads = await Thread.countDocuments();
    const totalPages = Math.ceil(totalThreads / limit);

    res.json({
      threads,
      pagination: {
        currentPage: page,
        totalPages,
        totalThreads,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/threads - Create a new thread
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, targetType, targetId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ message: 'Title must be 200 characters or less' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ message: 'Content must be 5000 characters or less' });
    }

    const thread = new Thread({
      creator: req.user.id,
      title: title.trim(),
      content: content.trim(),
      targetType: targetType || 'general',
      targetId: targetId || null
    });

    await thread.save();
    await thread.populate('creator', 'name email role');

    res.status(201).json({ thread, message: 'Thread created successfully' });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/threads/:id - Delete a thread
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Check if user can delete (owner, admin, or moderator)
    const canDelete = 
      thread.creator.toString() === req.user.id ||
      req.user.role === 'admin' ||
      req.user.role === 'moderator';

    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this thread' });
    }

    // Also delete all comments associated with this thread
    await Comment.deleteMany({ targetType: 'thread', targetId: thread._id });

    await Report.deleteMany({ type: 'thread', targetId: thread._id });

    await Thread.findByIdAndDelete(req.params.id);

    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/threads/:id/like - Like/unlike a thread
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const userId = req.user.id;
    const isLiked = thread.likes.includes(userId);
    const isDisliked = thread.dislikes.includes(userId);

    if (isLiked) {
      // Unlike
      thread.likes = thread.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      thread.likes.push(userId);
      // Remove from dislikes if present
      if (isDisliked) {
        thread.dislikes = thread.dislikes.filter(id => id.toString() !== userId);
      }
    }

    thread.likesCount = thread.likes.length;
    thread.dislikesCount = thread.dislikes.length;
    await thread.save();

    res.json({ 
      liked: !isLiked, 
      likesCount: thread.likesCount,
      dislikesCount: thread.dislikesCount,
      message: isLiked ? 'Thread unliked' : 'Thread liked'
    });
  } catch (error) {
    console.error('Error liking thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/threads/:id/dislike - Dislike/undislike a thread
router.post('/:id/dislike', authMiddleware, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const userId = req.user.id;
    const isLiked = thread.likes.includes(userId);
    const isDisliked = thread.dislikes.includes(userId);

    if (isDisliked) {
      // Remove dislike
      thread.dislikes = thread.dislikes.filter(id => id.toString() !== userId);
    } else {
      // Add dislike
      thread.dislikes.push(userId);
      // Remove from likes if present
      if (isLiked) {
        thread.likes = thread.likes.filter(id => id.toString() !== userId);
      }
    }

    thread.likesCount = thread.likes.length;
    thread.dislikesCount = thread.dislikes.length;
    await thread.save();

    res.json({ 
      disliked: !isDisliked, 
      likesCount: thread.likesCount,
      dislikesCount: thread.dislikesCount,
      message: isDisliked ? 'Thread undisliked' : 'Thread disliked'
    });
  } catch (error) {
    console.error('Error disliking thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/threads/:id - Get a specific thread with details
router.get('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('creator', 'name email role profileImage')
      .lean();

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Get comments count for this thread
    const commentsCount = await Comment.countDocuments({ 
      targetType: 'thread', 
      targetId: thread._id 
    });

    thread.commentsCount = commentsCount;

    res.json({ thread });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
