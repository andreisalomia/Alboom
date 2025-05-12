const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');
const Song = require('../models/Song');
const multer = require('multer');
const mongoose = require('mongoose');
const upload = multer({ storage: multer.memoryStorage() })



let bucket
mongoose.connection.once('open', () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'avatars'
  })
})


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
      .populate('favoriteSongs')
      .populate('friends', 'name')
      .populate('friendRequestsReceived', 'name');

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
      });

    const populatedReviews = await Promise.all(reviews.map(async review => {
      const reviewObj = review.toObject();
      let image = null;
      let name = null;

      if (reviewObj.targetType === 'song' && reviewObj.targetId) {
        const song = await Song.findById(reviewObj.targetId._id).populate('album');
        image = song?.album?.coverImage || null;
        name = song?.title || null;
      } else if (reviewObj.targetType === 'album' && reviewObj.targetId) {
        image = reviewObj.targetId.coverImage;
        name = reviewObj.targetId.title || null;
      } else if (reviewObj.targetType === 'artist' && reviewObj.targetId) {
        image = reviewObj.targetId.image;
        name = reviewObj.targetId.name || null;
      }

      return {
        ...reviewObj,
        score: reviewObj.upvotes.length - reviewObj.downvotes.length,
        upvotes: undefined,
        downvotes: undefined,
        image,
        content: reviewObj.content,
        name
      };
    }));

    res.json({
      ...user.toObject(),
      playlists,
      reviews: populatedReviews
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:userId/friend-status', authMiddleware, async (req, res) => {
  const me = req.user.id;
  const target = req.params.userId;

  if (me === target) return res.json({ status: 'self' });

  const user = await User.findById(me);

  if (user.friends.includes(target)) return res.json({ status: 'friends' });
  if (user.friendRequestsSent.includes(target)) return res.json({ status: 'sent' });
  if (user.friendRequestsReceived.includes(target)) return res.json({ status: 'received' });

  res.json({ status: 'none' });
});

router.post('/:userId/friends', authMiddleware, async (req, res) => {
  const me = req.user.id;
  const target = req.params.userId;

  if (me === target) return res.status(400).json({ message: 'You cannot friend yourself' });

  const [user, other] = await Promise.all([
    User.findById(me),
    User.findById(target)
  ]);

  if (user.friends.includes(target)) return res.json({ message: 'Already friends' });

  if (user.friendRequestsReceived.includes(target)) {
    user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== target);
    other.friendRequestsSent = other.friendRequestsSent.filter(id => id.toString() !== me);

    user.friends.push(target);
    other.friends.push(me);

    await user.save();
    await other.save();

    return res.json({ message: 'Friend request accepted' });
  }

  if (!user.friendRequestsSent.includes(target)) {
    user.friendRequestsSent.push(target);
    other.friendRequestsReceived.push(me);

    await user.save();
    await other.save();
  }

  res.json({ message: 'Friend request sent' });
});

router.delete('/:userId/friends', authMiddleware, async (req, res) => {
  const me = req.user.id;
  const target = req.params.userId;

  const [user, other] = await Promise.all([
    User.findById(me),
    User.findById(target)
  ]);

  user.friends = user.friends.filter(id => id.toString() !== target);
  other.friends = other.friends.filter(id => id.toString() !== me);

  user.friendRequestsSent = user.friendRequestsSent.filter(id => id.toString() !== target);
  user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== target);
  other.friendRequestsSent = other.friendRequestsSent.filter(id => id.toString() !== me);
  other.friendRequestsReceived = other.friendRequestsReceived.filter(id => id.toString() !== me);

  await user.save();
  await other.save();

  res.json({ message: 'Friend removed or request canceled' });
});

// GET /api/users/avatar/:fileId
router.get('/avatar/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    console.log('Avatar download requested for ID:', fileId);

    const _id = new mongoose.Types.ObjectId(fileId);
    // check the file exists
    const files = await bucket.find({ _id }).toArray();
    if (!files || files.length === 0) {
      console.warn('No avatar file found for', fileId);
      return res.sendStatus(404);
    }

    // stream it
    bucket.openDownloadStream(_id)
      .on('error', err => {
        console.error('GridFS download error:', err);
        res.sendStatus(500);
      })
      .pipe(res);
  } catch (err) {
    console.error('Avatar endpoint error:', err);
    res.sendStatus(400);
  }
});

router.patch('/me', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const updates = {}
    if (req.body.name) updates.name = req.body.name.trim()
    if (req.file && bucket) {
      const ext = path.extname(req.file.originalname)
      const uploadStream = bucket.openUploadStream(
        `${req.user.id}-${Date.now()}${ext}`,
        { contentType: req.file.mimetype }
      );
      uploadStream.end(req.file.buffer);
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });
      updates.profileImage = uploadStream.id;
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')
    res.json(user)
  } catch (err) {
    console.error('Profile update error:', err);
    if (err.code === 11000 && err.keyPattern?.name) {
      return res.status(409).json({ message: 'That username is already taken.' });
    }
    res.status(400).json({ message: err.message || 'Unknown error' });
  }
})

router.get('/me/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User
      .findById(req.user.id)
      .populate({
        path: 'favoriteSongs',
        populate: { path: 'artist', select: 'name' }
      });
    res.json(user.favoriteSongs);
  } catch (err) {
    console.error('Fetching favorites failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/users/me/favorites
router.post('/me/favorites', authMiddleware, async (req, res) => {
  const { songId } = req.body;
  if (!songId) {
    return res.status(400).json({ message: 'songId is required' });
  }
  try {
    const user = await User.findById(req.user.id);
    // evităm duplicatele
    if (!user.favoriteSongs.includes(songId)) {
      user.favoriteSongs.push(songId);
      await user.save();
    }
    res.status(201).json({ favoriteSongs: user.favoriteSongs });
  } catch (err) {
    console.error('Adding favorite failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/me/favorites/:songId
router.delete('/me/favorites/:songId', authMiddleware, async (req, res) => {
  const { songId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    user.favoriteSongs = user.favoriteSongs.filter(
      id => id.toString() !== songId
    );
    await user.save();
    res.json({ favoriteSongs: user.favoriteSongs });
  } catch (err) {
    console.error('Removing favorite failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET  /api/users/me/playlists
router.get(
  '/me/playlists',
  authMiddleware,
  async (req, res) => {
    try {
      const lists = await Playlist
        .find({ owner: req.user.id })
        .populate('songs');
      res.json(lists);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      res.status(500).json({ message: 'Server error fetching playlists' });
    }
  }
);

// POST /api/users/me/playlists
router.post(
  '/me/playlists',
  authMiddleware,
  async (req, res) => {
    const { name, isPublic } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Playlist name required' });
    }
    try {
      const playlist = new Playlist({
        name,
        owner: req.user.id,
        songs: [],
        isPublic: isPublic ?? true
      });
      await playlist.save();
      res.status(201).json(playlist);
    } catch (err) {
      console.error('Error creating playlist:', err);
      res.status(500).json({ message: 'Server error creating playlist' });
    }
  }
);

// POST /api/users/me/playlists/:playlistId/songs
router.post(
  '/me/playlists/:playlistId/songs',
  authMiddleware,
  async (req, res) => {
    const { playlistId } = req.params;
    const { songId }     = req.body;
    if (!songId) {
      return res.status(400).json({ message: 'songId is required' });
    }
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found' });
      }
      if (playlist.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (!playlist.songs.includes(songId)) {
        playlist.songs.push(songId);
        await playlist.save();
      }
      // populate before returning, dacă vrei
      await playlist.populate('songs');
      res.json(playlist);
    } catch (err) {
      console.error('Error adding song to playlist:', err);
      res.status(500).json({ message: 'Server error adding song to playlist' });
    }
  }
);


module.exports = router