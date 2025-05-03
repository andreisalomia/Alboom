const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  verified: { type: Boolean, default: false },
  verificationCode: String,
  resetPasswordCode: String,
  resetPasswordExpires: Date,
  password: String,
  role: {
    type: String,
    enum: ['authenticated_user', 'moderator', 'admin'],
    default: 'authenticated_user'
  },
  profileImage: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favoriteArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
  favoriteAlbums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
  favoriteSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
