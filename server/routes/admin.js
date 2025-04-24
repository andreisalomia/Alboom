const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');

/** helper that only lets admins continue */
const onlyAdmin = (req, res, next) =>
    req.user?.role === 'admin'
        ? next()
        : res.status(403).json({ message: 'Admins only' });

router.use(auth, onlyAdmin);

/* ----------  ARTIST  ---------------- */
router.post('/artists', async (req, res) => {
    const { name, bio, image } = req.body;
    const existing = await Artist.findOne({ name });
    if (existing) return res.json(existing);                     // idempotent
    const artist = await Artist.create({ name, bio, image });
    res.status(201).json(artist);
});

/* ----------  ALBUM  ----------------- */
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

/* ----------  SONG   ----------------- */
router.post('/songs', async (req, res) => {
    const { title, artistId, artistName, albumId, genre, duration } = req.body;

    // Ensure artist exists (auto-create on the fly if only a name was provided)
    let artist;
    if (artistId) artist = await Artist.findById(artistId);
    if (!artist && artistName) artist = await Artist.create({ name: artistName });

    if (!artist) return res.status(400).json({ message: 'Artist required' });

    // Album is optional – allow singles
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

module.exports = router;
