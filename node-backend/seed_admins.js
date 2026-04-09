const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const admins = [
  { name: 'Suresh', username: 'admin_suresh', password: 'stocktraq@6662' },
  { name: 'Ramana', username: 'admin_ramana', password: 'stocktraq@6663' },
  { name: 'Saiteja', username: 'admin_saiteja', password: 'stocktraq@6649' },
  { name: 'Sampreeth', username: 'admin_sampreeth', password: 'stocktraq@6635' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stocktraq_admin');
    console.log('Connected to MongoDB');

    // Drop collection to remove old indexes (like email_1)
    try {
      await Admin.collection.drop();
      console.log('Dropped existing admins collection to reset indexes');
    } catch (e) {
      if (e.code === 26) { // NamespaceNotFound
        console.log('Collection does not exist, skipping drop');
      } else {
        throw e;
      }
    }

    // Insert new
    for (const adminData of admins) {
      // Create new instance to trigger pre-save password hashing
      const admin = new Admin(adminData);
      await admin.save();
      console.log(`Created admin: ${adminData.name} (${adminData.username})`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
