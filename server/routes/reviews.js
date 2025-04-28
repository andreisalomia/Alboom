const express = require('express');
const auth = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const router = express.Router();

// GET all reviews for a given entity
router.get('/', async (req, res) => {
  const { targetType, targetId } = req.query;
  if (!targetType || !targetId) {
    return res.status(400).json({ message: 'targetType & targetId required' });
  }
  const reviews = await Review.find({ targetType, targetId })
    .populate('author', 'name');    // ← populate author
  res.json(reviews);
});

// POST to create/update or delete a review
router.post('/', auth, async (req, res) => {
  const { targetType, targetId, rating } = req.body;
  if (!targetType || !targetId || typeof rating !== 'number') {
    return res.status(400).json({ message: 'targetType, targetId & numeric rating required' });
  }
  const userId = req.user.id;
  let review = await Review.findOne({ author: userId, targetType, targetId });

  if (review) {
    // same rating => remove
    if (review.rating === rating) {
      await review.deleteOne();
      return res.json({ deleted: true });
    }
    // different rating => update
    review.rating = rating;
    await review.save();
    return res.json({ review });
  }

  // no existing review => create new
  review = new Review({ author: userId, targetType, targetId, rating });
  await review.save();
  await review.populate('author', 'name');
  res.status(201).json({ review });
});

module.exports = router;
