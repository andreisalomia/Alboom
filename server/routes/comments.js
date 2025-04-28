// server/routes/comments.js

const express = require('express');
const auth = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const router = express.Router();

// GET all comments for a given target
router.get('/', async (req, res) => {
  const { targetType, targetId } = req.query;
  if (!targetType || !targetId) {
    return res.status(400).json({ message: 'targetType & targetId required' });
  }
  const comments = await Comment.find({ targetType, targetId })
    .sort('createdAt')
    .populate('author', 'name');
  res.json(comments);
});

// POST a new comment or reply
router.post('/', auth, async (req, res) => {
  const { targetType, targetId, parentId, content } = req.body;
  const comment = await Comment.create({
    author:     req.user.id,
    targetType,
    targetId,
    parentId:   parentId || undefined,
    content,
    likes:      [],
    dislikes:   []
  });
  await comment.populate('author', 'name');
  res.status(201).json(comment);
});

// DELETE a comment
router.delete('/:id', auth, async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  const me = req.user;
  // only author or mod/admin can delete
  if (c.author.toString() !== me.id && !['moderator','admin'].includes(me.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  // ← replace remove() with deleteOne()
  await c.deleteOne();
  res.json({ message: 'Deleted' });
});

// LIKE / DISLIKE
router.post('/:id/like', auth, async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  const me = req.user.id;
  c.dislikes = c.dislikes.filter(u => u.toString() !== me);
  if (c.likes.find(u => u.toString() === me)) {
    c.likes = c.likes.filter(u => u.toString() !== me);
  } else {
    c.likes.push(me);
  }
  await c.save();
  res.json(c);
});

router.post('/:id/dislike', auth, async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  const me = req.user.id;
  c.likes = c.likes.filter(u => u.toString() !== me);
  if (c.dislikes.find(u => u.toString() === me)) {
    c.dislikes = c.dislikes.filter(u => u.toString() !== me);
  } else {
    c.dislikes.push(me);
  }
  await c.save();
  res.json(c);
});

module.exports = router;
