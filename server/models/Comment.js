const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType:  { type: String, enum: ['song','album','artist','thread'], required: true },
  targetId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  parentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  content:     { type: String, required: true },
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
