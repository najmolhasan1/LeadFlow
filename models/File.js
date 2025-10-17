const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('File', fileSchema);