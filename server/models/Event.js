// models/Event.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title:       String,
  date:        Date,
  location:    String,
  description: String,
  organizer:   { type: Schema.Types.ObjectId, ref: 'User' },
  participants:[{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Event', eventSchema);
