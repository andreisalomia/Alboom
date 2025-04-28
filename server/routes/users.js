const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

router.get('/:userId', async (req, res) => {
  try {
    const requestingUserId = req.headers.authorization ? 
      jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET)?.id : 
      null;

    const selectFields = requestingUserId === req.params.userId
      ? '-password -verified -verificationCode'
      : '-password -verified -verificationCode -email -notifications';

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

    res.json({
      ...user.toObject(),
      playlists,
      isOwnProfile: requestingUserId === req.params.userId
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;