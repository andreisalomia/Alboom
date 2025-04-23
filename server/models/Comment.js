const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  content: String
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);