const express = require('express');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');

const router = express.Router();

router.get('/artists', async (req, res) => {
  const artists = await Artist.find();
  res.json(artists);
});

router.get('/albums', async (req, res) => {
    const albums = await Album.find().populate('artist');
    // console.log('Albume:', JSON.stringify(albums, null, 2));
    res.json(albums);
  });

router.get('/songs', async (req, res) => {
  const songs = await Song.find().populate('artist').populate('album');
  res.json(songs);
});

/*  ───────── NOI: DETALIU PE ID ───────── */
router.get('/artists/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
      .populate('albums')                // discografie
      .populate({                        // piese
        path: 'albums',
        populate: { path: 'songs' }
      });
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/albums/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('artist')
      .populate('songs');
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.json(album);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artist')
      .populate('album');
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
