const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  type: {
    type: String,
    enum: ['focus', 'short_break', 'long_break'],
    default: 'focus',
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);