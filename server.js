// const express = require('express');
// const mongoose = require('mongoose');
// const path = require('path');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(express.static('public'));
// app.use('/uploads', express.static('uploads'));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/admin', require('./routes/admin'));
// app.use('/api/files', require('./routes/files'));

// // Serve HTML pages
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/download/:fileId', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'download.html'));
// });

// app.get('/admin-dashboard', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
// });

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB Connected'))
// .catch(err => console.log(err));

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const path = require('path');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(express.static('public'));
// app.use('/uploads', express.static('uploads'));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/admin', require('./routes/admin'));
// app.use('/api/files', require('./routes/files'));

// // Serve HTML pages - UPDATED ROUTES WITHOUT .html
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/register', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'user-register.html'));
// });

// app.get('/login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'user-login.html'));
// });

// app.get('/admin', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
// });

// app.get('/admin-dashboard', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
// });

// app.get('/download/:fileId', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'download.html'));
// });

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB Connected'))
// .catch(err => console.log(err));

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/files', require('./routes/files'));

// Serve HTML pages - UPDATED ROUTES WITHOUT .html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  // Extract source platform from referrer or query parameter
  const referrer = req.get('Referrer');
  let sourcePlatform = 'Direct';
  
  if (req.query.source) {
    sourcePlatform = req.query.source;
  } else if (referrer) {
    if (referrer.includes('facebook.com') || referrer.includes('fb.com')) {
      sourcePlatform = 'Facebook';
    } else if (referrer.includes('youtube.com')) {
      sourcePlatform = 'YouTube';
    } else if (referrer.includes('linkedin.com')) {
      sourcePlatform = 'LinkedIn';
    } else if (referrer.includes('whatsapp.com') || referrer.includes('wa.me')) {
      sourcePlatform = 'WhatsApp';
    } else if (referrer.includes('instagram.com')) {
      sourcePlatform = 'Instagram';
    } else if (referrer.includes('twitter.com') || referrer.includes('x.com')) {
      sourcePlatform = 'Twitter';
    }
  }
  
  // Redirect to register page with source tracking
  const fileId = req.query.fileId;
  let redirectUrl = `/register-page?source=${encodeURIComponent(sourcePlatform)}`;
  if (fileId) {
    redirectUrl += `&fileId=${fileId}`;
  }
  res.redirect(redirectUrl);
});

app.get('/register-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user-register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user-login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/download/:fileId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
