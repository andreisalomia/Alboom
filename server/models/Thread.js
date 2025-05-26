const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 5000 },
  targetType: { type: String, enum: ['song', 'album', 'artist', 'general'], default: 'general' },  targetId: mongoose.Schema.Types.ObjectId,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  dislikesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 }
}, { timestamps: true });

// Virtual for calculating likes count
threadSchema.virtual('actualLikesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for calculating dislikes count
threadSchema.virtual('actualDislikesCount').get(function() {
  return this.dislikes ? this.dislikes.length : 0;
});

// Update counts before saving
threadSchema.pre('save', function() {
  this.likesCount = this.likes ? this.likes.length : 0;
  this.dislikesCount = this.dislikes ? this.dislikes.length : 0;
});

module.exports = mongoose.model('Thread', threadSchema);
