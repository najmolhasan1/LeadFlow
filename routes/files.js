const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const auth = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}




// Multer configuration - UPDATED FOR BENGALI FILENAME SUPPORT
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Use original filename without modification for storage
    // Preserve Bengali characters in filename
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, Date.now() + '-' + originalName);
  }
});



const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG), PDFs, and Word documents are allowed'));
    }
  }
});

// Upload file (admin only)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { topic } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const file = new File({
      topic: topic.trim(),
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname
    });

    await file.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        topic: file.topic,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        originalName: file.originalName,
        downloadLink: `${req.protocol}://${req.get('host')}/download/${file._id}`
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all files (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const files = await File.find().sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single file for download
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download file - ALTERNATIVE FIX
router.get('/:id/download', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', file.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // ALTERNATIVE FIX: Use both filename and filename* for maximum compatibility
    const encodedFilename = encodeURIComponent(file.originalName);
    
    // Set headers for download
    res.setHeader('Content-Disposition', 
      `attachment; filename="${file.originalName}"; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(500).json({ message: error.message });
});




// Delete file
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', file.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
