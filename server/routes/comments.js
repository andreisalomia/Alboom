// server/routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
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
    const populated = await comment
      .populate('author', 'name profileImage')
      .execPopulate();
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
    await comment.remove();
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
    if (!comment.likes.includes(uid)) {
      comment.likes.push(uid);
      comment.dislikes = comment.dislikes.filter(d => d.toString() !== uid);
      await comment.save();
    }
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
    if (!comment.dislikes.includes(uid)) {
      comment.dislikes.push(uid);
      comment.likes = comment.likes.filter(l => l.toString() !== uid);
      await comment.save();
    }
    res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length });
  } catch (err) {
    console.error('Failed to dislike comment:', err);
    res.status(500).json({ message: 'Failed to dislike comment' });
  }
});

module.exports = router;
