const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const Event = require('../models/Event');

const onlyAdmin = (req, res, next) =>
    req.user?.role === 'admin'
        ? next()
        : res.status(403).json({ message: 'Admins only' });

router.use(auth, onlyAdmin);

router.post('/artists', async (req, res) => {

    const { name, bio, image } = req.body;
    const existing = await Artist.findOne({ name });
    if (existing) return res.json(existing);
    const artist = await Artist.create({ name, bio, image });
    res.status(201).json(artist);
});

router.post('/events', async (req, res) => {

    const { title, date, location, organizer } = req.body;
    const newEvent = await Event.create({ title, date, location, organizer });
    res.status(201).json(newEvent);

});

router.post('/albums', async (req, res) => {
    const { title, genre, releaseDate, coverImage, artistId, artistName } = req.body;

    let artist = null;

    if (artistId) {
        artist = await Artist.findById(artistId);
    }

    if (!artist && artistName) {
        const existing = await Artist.findOne({ name: artistName });
        artist = existing || await Artist.create({ name: artistName });
    }

    if (!artist) {
        return res.status(400).json({ message: 'Artist is required' });
    }

    const album = await Album.create({
        title,
        genre,
        releaseDate,
        coverImage,
        artist: artist._id,
    });

    res.status(201).json(await album.populate('artist'));
});

router.post('/songs', async (req, res) => {
    const { title, artistId, artistName, albumId, genre, duration } = req.body;

    let artist;
    if (artistId) artist = await Artist.findById(artistId);
    if (!artist && artistName) artist = await Artist.create({ name: artistName });

    if (!artist) return res.status(400).json({ message: 'Artist required' });

    let album = null;
    if (albumId) album = await Album.findById(albumId);

    const song = await Song.create({
        title,
        duration,
        genre,
        artist: artist._id,
        album: album ? album._id : undefined,
    });

    res.status(201).json(await song.populate(['artist', 'album']));
});




router.delete('/songs/:id', async (req, res) => {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Delete associated reviews & comments
    await Promise.all([
        Review.deleteMany({ targetType: 'song', targetId: song._id }),
        Comment.deleteMany({ targetType: 'song', targetId: song._id })
    ]);

    await song.deleteOne();
    res.json({ message: 'Song deleted successfully' });
});

router.delete('/albums/:id', async (req, res) => {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    // Delete all associated songs
    const songs = await Song.find({ album: album._id });
    for (const song of songs) {
        await Review.deleteMany({ targetType: 'song', targetId: song._id });
        await Comment.deleteMany({ targetType: 'song', targetId: song._id });
        await song.deleteOne();
    }

    // Delete album's reviews & comments
    await Promise.all([
        Review.deleteMany({ targetType: 'album', targetId: album._id }),
        Comment.deleteMany({ targetType: 'album', targetId: album._id })
    ]);

    await album.deleteOne();
    res.json({ message: 'Album and related data deleted successfully' });
});

router.delete('/artists/:id', async (req, res) => {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    const albums = await Album.find({ artist: artist._id });
    for (const album of albums) {
        const songs = await Song.find({ album: album._id });
        for (const song of songs) {
            await Review.deleteMany({ targetType: 'song', targetId: song._id });
            await Comment.deleteMany({ targetType: 'song', targetId: song._id });
            await song.deleteOne();
        }

        await Review.deleteMany({ targetType: 'album', targetId: album._id });
        await Comment.deleteMany({ targetType: 'album', targetId: album._id });
        await album.deleteOne();
    }

    await Song.deleteMany({ artist: artist._id });
    await Review.deleteMany({ targetType: 'artist', targetId: artist._id });
    await Comment.deleteMany({ targetType: 'artist', targetId: artist._id });

    await artist.deleteOne();
    res.json({ message: 'Artist and all related data deleted successfully' });
});



router.delete('/events/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
