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
    console.log('Albums with populated artists:', JSON.stringify(albums, null, 2));
    res.json(albums);
  });  

router.get('/songs', async (req, res) => {
  const songs = await Song.find().populate('artist').populate('album');
  res.json(songs);
});

module.exports = router;
