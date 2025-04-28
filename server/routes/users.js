const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');

// informatii basic pentru profile overview, informatii mai detaliate in alte rute
router.get('/:userId', async (req, res) => {
  try {
    const requestingUserId = req.headers.authorization ? 
      jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)?.id : 
      null;

    const selectFields = requestingUserId === req.params.userId
      ? '-password -verified -verificationCode'
      : '-password -verified -verificationCode -email';

    const user = await User.findById(req.params.userId)
      .select(selectFields)
      .populate('favoriteArtists')
      .populate('favoriteAlbums')
      .populate('favoriteSongs');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const playlistQuery = {
      owner: req.params.userId,
      ...(requestingUserId !== req.params.userId && { isPublic: true })
    };

    const playlists = await Playlist.find(playlistQuery).populate('songs');

    const reviews = await Review.find({ author: req.params.userId })
      .populate('author', 'name')
      .populate({
        path: 'targetId',
        refPath: 'targetType'
      })

    const reviews2 = reviews.map(review => {
        const reviewObj = review.toObject();
        return {
          ...reviewObj,
          score: reviewObj.upvotes.length - reviewObj.downvotes.length,
          upvotes: undefined,
          downvotes: undefined
        };
      });
      // da doar diferenta de voturi

    res.json({
      ...user.toObject(),
      playlists,
      reviews: reviews2
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;