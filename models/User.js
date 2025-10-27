const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  whatsapp: {
    type: String,
    required: true,
    trim: true
  },
  eduLevel: {
    type: String,
    required: true,
    enum: ['SSC/HSC Level', 'Honors Level', 'Diploma/Polytechnic', 'Madrasha Level', 'Others']
  },
  knowledgeLevel: {
    type: String,
    required: true,
    enum: ['Noob', 'Beginner', 'Mid Level', 'Expert Level', 'Job Holder']
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  },
  sourcePlatform: {
    type: String,
    default: 'Direct'
  },
  registeredForFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File', // ✅ এই লাইন যোগ করুন
    default: null
  }
}, {
  timestamps: true,
  strictPopulate: false // ✅ এই লাইন যোগ করুন Railway-এর জন্য
});

module.exports = mongoose.model('User', userSchema);
