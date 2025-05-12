const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  verified: { type: Boolean, default: false },
  verificationCode: String,
  resetPasswordCode: String,
  resetPasswordExpires: Date,
  password: { type: String, required: true },
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
  friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
