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

router.get('/artists/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Artistul simplu (fără populate, că nu ne folosește)
    const artist = await Artist.findById(id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    // 2. Albumele și piesele asociate
    const [albums, songs] = await Promise.all([
      Album.find({ artist: id }).populate('songs'),   // tracklist în fiecare album
      Song.find({ artist: id }).populate('album')     // pentru single-uri vezi albumul
    ]);

    // 3. Trimitem totul într-un singur JSON
    res.json({
      ...artist.toObject(),
      albums,
      songs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/albums/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. albumul + artistul
    const album = await Album.findById(id).populate('artist');
    if (!album) return res.status(404).json({ message: 'Album not found' });

    // 2. toate piesele care au album = id  (ordine după tracklistul real – aici simplu după _id)
    const songs = await Song.find({ album: id }).sort({ _id: 1 });

    // 3. trimitem totul la front-end
    res.json({
      ...album.toObject(),
      songs
    });
  } catch (err) {
    console.error(err);
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


const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');   // scăpăm regex-ul

router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);                // întoarcem listă goală dacă nu se scrie nimic

  const rx = new RegExp(escape(q), 'i');      // căutare case-insensitive
  try {
    const [artists, albums, songs] = await Promise.all([
      Artist.find({ name:   rx }).limit(5),                    // max 5 rezultate / tip
      Album.find ({ title:  rx }).limit(5).populate('artist'),
      Song.find  ({ title:  rx }).limit(5).populate('artist')
    ]);

    //  normalizăm rezultatele într-un singur tablou
    const results = [
      ...artists.map(a => ({ type: 'artist', id: a._id,  text: a.name,            image: a.image })),
      ...albums .map(a => ({ type: 'album',  id: a._id,  text: a.title,
                             sub: a.artist?.name,         image: a.coverImage })),
      ...songs  .map(s => ({ type: 'song',   id: s._id,   text: s.title,
                             sub: s.artist?.name }))
    ];

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
