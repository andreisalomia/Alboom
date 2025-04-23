const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: String,
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  duration: Number,
  genre: String
});

module.exports = mongoose.model('Song', songSchema);