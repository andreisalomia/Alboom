// server/routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Thread = require('../models/Thread');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/comments?targetType=...&targetId=...
router.get('/', async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
      return res.status(400).json({ message: 'Missing targetType or targetId' });
    }
    const comments = await Comment.find({ targetType, targetId })
      .sort({ createdAt: 1 })
      .populate('author', 'name profileImage');
    res.json(comments);
  } catch (err) {
    console.error('Failed to load comments:', err);
    res.status(500).json({ message: 'Failed to load comments' });
  }
});

// POST /api/comments
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { targetType, targetId, parentId, content } = req.body;
    const comment = new Comment({
      targetType,
      targetId,
      parentId: parentId || null,
      content,
      author: req.user.id
    });

    await comment.save();

    // Update thread comment count if this is a thread comment
    if (targetType === 'thread') {
      await Thread.findByIdAndUpdate(targetId, {
        $inc: { commentsCount: 1 }
      });
    }

    const populated = await comment.populate('author', 'name profileImage'); 
    res.status(201).json(populated); 
  } catch (err) {
    console.error('Failed to post comment:', err);
    res.status(500).json({ message: 'Failed to post comment' });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id && req.user.role === 'authenticated_user') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update thread comment count if this is a thread comment
    if (comment.targetType === 'thread') {
      await Thread.findByIdAndUpdate(comment.targetId, {
        $inc: { commentsCount: -1 }
      });
    }

    await Comment.deleteOne({ _id: req.params.id });  
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Failed to delete comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// POST /api/comments/:id/like
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const uid = req.user.id;

    
    if (comment.likes.includes(uid)) {
      comment.likes = comment.likes.filter(like => like.toString() !== uid);
    } else {
      
      comment.likes.push(uid);
      comment.dislikes = comment.dislikes.filter(dislike => dislike.toString() !== uid);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length });
  } catch (err) {
    console.error('Failed to like comment:', err);
    res.status(500).json({ message: 'Failed to like comment' });
  }
});

// POST /api/comments/:id/dislike
router.post('/:id/dislike', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const uid = req.user.id;

   
    if (comment.dislikes.includes(uid)) {
      comment.dislikes = comment.dislikes.filter(dislike => dislike.toString() !== uid);
    } else {
      
      comment.dislikes.push(uid);
      comment.likes = comment.likes.filter(like => like.toString() !== uid);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length });
  } catch (err) {
    console.error('Failed to dislike comment:', err);
    res.status(500).json({ message: 'Failed to dislike comment' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = content;
    await comment.save();

    const populated = await comment.populate('author', 'name profileImage');
    res.json(populated);
  } catch (err) {
    console.error('Failed to edit comment:', err);
    res.status(500).json({ message: 'Failed to edit comment' });
  }
});

module.exports = router;
