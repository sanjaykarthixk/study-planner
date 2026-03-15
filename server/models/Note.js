const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);