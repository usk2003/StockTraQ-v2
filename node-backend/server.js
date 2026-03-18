const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Models
const Admin = require('./models/Admin');
const Ipo = require('./models/Ipo');
const Blog = require('./models/Blog');
const Version = require('./models/Version');
const User = require('./models/User');
const Faq = require('./models/Faq');
const bcrypt = require('bcryptjs');
const { mongo } = require('mongoose'); // Just for safety if needed




// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stocktraq_admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authenticateUserToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    if (!user.userId) return res.sendStatus(403); // Verify it's a user token
    req.user = user;
    next();
  });
};


// Routes

// POST /admin/login
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    res.json({ token, name: admin.name });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const newUser = new User({ name, email, password });
    await newUser.save();
    
    // Create token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    res.status(201).json({ message: 'User registered successfully', token, user: { name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed', details: error.message });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/me
app.get('/api/me', authenticateUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// POST /admin/add-ipo
app.post('/admin/add-ipo', authenticateToken, async (req, res) => {
  try {
    const newIpo = new Ipo(req.body);
    await newIpo.save();
    res.status(201).json({ message: 'IPO added successfully', ipo: newIpo });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add IPO', details: error.message });
  }
});

// DELETE /admin/ipo/:id
app.delete('/admin/ipo/:id', authenticateToken, async (req, res) => {
  try {
    await Ipo.findByIdAndDelete(req.params.id);
    res.json({ message: 'IPO successfully deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Delete failed', details: error.message });
  }
});


// POST /admin/add-blog
app.post('/admin/add-blog', authenticateToken, async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.status(201).json({ message: 'Blog added successfully', blog: newBlog });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add Blog', details: error.message });
  }
});

// DELETE /admin/blog/:id
app.delete('/admin/blog/:id', authenticateToken, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog successfully deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Delete failed', details: error.message });
  }
});

// GET /admin/users
app.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /admin/add-faq
app.post('/admin/add-faq', authenticateToken, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const newFaq = new Faq({ question, answer });
    await newFaq.save();
    res.status(201).json({ message: 'FAQ added successfully', faq: newFaq });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add FAQ', details: error.message });
  }
});

// GET /api/faqs
app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /admin/faq/:id
app.delete('/admin/faq/:id', authenticateToken, async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Delete failed', details: error.message });
  }
});

// PUT /admin/ipo/:id
app.put('/admin/ipo/:id', authenticateToken, async (req, res) => {
  try {
    const updatedIpo = await Ipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'IPO updated successfully', ipo: updatedIpo });
  } catch (error) {
    res.status(400).json({ error: 'Update failed', details: error.message });
  }
});


// GET /api/blogs

app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // Newest first
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blogs/:id
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/add-version
app.post('/admin/add-version', authenticateToken, async (req, res) => {
  try {
    const { version, changes } = req.body;
    // Update existing or create new
    const updatedVersion = await Version.findOneAndUpdate(
      { version },
      { version, changes, createdAt: Date.now() },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: 'Version updated successfully', data: updatedVersion });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update Version', details: error.message });
  }
});

// GET /api/version/latest
app.get('/api/version/latest', async (req, res) => {
  try {
    const latest = await Version.findOne().sort({ createdAt: -1 }); // Newest first
    if (!latest) return res.status(404).json({ error: 'No version data available' });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



// GET /api/ipos/ongoing
// Return IPOs where closeDate >= current date
app.get('/api/ipos/ongoing', async (req, res) => {
  try {
    const today = new Date();
    // Reset time part to compare dates properly
    today.setHours(0, 0, 0, 0);
    const ipos = await Ipo.find({ closeDate: { $gte: today } }).sort({ closeDate: 1 });
    res.json(ipos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/ipos/closed
// Return IPOs where closeDate < current date
app.get('/api/ipos/closed', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ipos = await Ipo.find({ closeDate: { $lt: today } }).sort({ closeDate: -1 });
    res.json(ipos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Seed admin script (development purpouse)
app.post('/admin/setup', async (req, res) => {
  try {
    // Only allow if no admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) return res.status(400).json({ error: 'Admin already exists' });
    
    const { email, password } = req.body;
    const admin = new Admin({ email, password });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/live-rates
// Fetch live prices for indices and commodities
app.get('/api/live-rates', async (req, res) => {
  const { spawn } = require('child_process');
  const path = require('path');
  
  // Path to script which is in the root directory (one level up from node-backend)
  const scriptPath = path.join(__dirname, '..', 'fetch_indices.py');
  
  // Execute python script
  const pythonProcess = spawn('python', [scriptPath]);
  
  let dataString = '';
  let errorString = '';
  
  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorString += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}. Error: ${errorString}`);
      return res.status(500).json({ error: 'Failed to fetch live rates', details: errorString });
    }
    try {
      const parsedData = JSON.parse(dataString);
      res.json(parsedData);
    } catch (e) {
      console.error('Failed to parse Python output:', dataString);
      res.status(500).json({ error: 'Failed to parse live rates data' });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node.js Admin Backend running on port ${PORT}`);
});
