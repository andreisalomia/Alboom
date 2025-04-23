const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  content: String,
  targetType: { type: String, enum: ['song', 'album', 'artist'] },
  targetId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

module.exports = mongoose.model('Thread', threadSchema);
