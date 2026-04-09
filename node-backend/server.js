const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
const LiveRate = require('./models/LiveRate');
const Waitlist = require('./models/Waitlist');
const Idea = require('./models/Idea');
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
    if (!user.adminId) return res.sendStatus(403); // Strictly require Admin identity
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
    const { name, email, password, securityQuestion, securityAnswer } = req.body;
    
    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'Security question and answer are required' });
    }

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const newUser = new User({ name, email, password, securityQuestion, securityAnswer });
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
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/user/security-question
app.get('/api/user/security-question', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ securityQuestion: user.securityQuestion });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/forgot-password
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;
    if (!email || !securityAnswer) return res.status(400).json({ error: 'Email and answer are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.compareSecurityAnswer(securityAnswer);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect security answer' });

    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');
    
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 900000; // 15 mins
    await user.save();

    res.json({ token, message: 'Identity verified. You may now reset your password.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reset-password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/change-password
app.post('/api/change-password', authenticateUserToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'All fields are required' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect current password' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'ID Token is required' });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      // Create a default password for Google users
      user = new User({
        name,
        email,
        password: Math.random().toString(36).slice(-10), // Dummy password
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Google authentication failed', details: error.message });
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

// PUT /api/user/investor-profile
app.put('/api/user/investor-profile', authenticateUserToken, async (req, res) => {
  try {
    const { investorProfile } = req.body;
    if (!investorProfile) return res.status(400).json({ error: 'Investor profile data is required' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.investorProfile = {
      ...user.investorProfile,
      ...investorProfile
    };

    await user.save();
    res.json({ message: 'Investor profile updated successfully', investorProfile: user.investorProfile });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/waitlist
app.post('/api/waitlist', async (req, res) => {
  try {
    const { name, email } = req.body;
    const existing = await Waitlist.findOne({ email });
    if (existing) return res.status(400).json({ error: 'You are already on the waitlist!' });

    const newEntry = new Waitlist({ name, email });
    await newEntry.save();
    res.status(201).json({ message: 'Subscribed to Waitlist successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Subscription failed', details: error.message });
  }
});

// POST /api/ideas
app.post('/api/ideas', async (req, res) => {
  try {
    const { name, email, title, description } = req.body;
    const newIdea = new Idea({ name, email, title, description });
    await newIdea.save();
    res.status(201).json({ message: 'Idea submitted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Idea submission failed', details: error.message });
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

// PUT /admin/blog/:id
app.put('/admin/blog/:id', authenticateToken, async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    res.status(400).json({ error: 'Update failed', details: error.message });
  }
});

// PUT /admin/faq/:id
app.put('/admin/faq/:id', authenticateToken, async (req, res) => {
  try {
    const updatedFaq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'FAQ updated successfully', faq: updatedFaq });
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

// GET /api/ipos/search
app.get('/api/ipos/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const ipos = await Ipo.find({
      companyName: { $regex: q, $options: 'i' }
    }).limit(10);
    res.json(ipos);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/ipos/best-listed
app.get('/api/ipos/best-listed', async (req, res) => {
  try {
    // Sort by GMP descending as anchor for high performers
    const ipos = await Ipo.find().sort({ gmp: -1 }).limit(6);
    res.json(ipos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch best listed' });
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
  try {
    const rates = await LiveRate.find();
    const formatted = {};
    rates.forEach(r => {
      formatted[r.name] = { 
        value: r.value, 
        change: r.change, 
        changePercent: r.changePercent, 
        isPositive: r.isPositive 
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch live rates from DB' });
  }
});

// Background rate fetcher
const { spawn } = require('child_process');
const path = require('path');

async function fetchAndStoreRates() {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'fetch_indices.py');
  const pythonProcess = spawn('python', [scriptPath]);
  
  let dataString = '';
  pythonProcess.stdout.on('data', (data) => dataString += data.toString());
  
  pythonProcess.on('close', async (code) => {
    if (code !== 0) return;
    try {
      const parsedData = JSON.parse(dataString);
      for (const [name, data] of Object.entries(parsedData)) {
        await LiveRate.findOneAndUpdate(
          { name },
          { 
            value: data.value, 
            change: data.change, 
            changePercent: data.changePercent, 
            isPositive: data.isPositive,
            updatedAt: Date.now() 
          },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      // Fail silently for background job to avoid logs clutter
    }
  });
}

// Run every 1 minute
setInterval(fetchAndStoreRates, 60000);
// Run once on startup
setTimeout(fetchAndStoreRates, 5000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node.js Admin Backend running on port ${PORT}`);
});
