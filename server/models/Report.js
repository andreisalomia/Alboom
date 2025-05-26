const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['comment', 'review', 'thread', 'user'] },
  targetId: mongoose.Schema.Types.ObjectId,
  reason: String,
  url: String,
  handled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
