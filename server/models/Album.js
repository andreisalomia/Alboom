const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: String,
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  releaseDate: Date,
  genre: String,
  coverImage: String,
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
});

module.exports = mongoose.model('Album', albumSchema);