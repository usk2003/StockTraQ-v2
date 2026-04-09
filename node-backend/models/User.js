const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
  investorProfile: {
    riskAppetite: { type: String, enum: ['Conservative', 'Moderate', 'Aggressive'], default: 'Moderate' },
    experience: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    primaryGoal: { type: String, enum: ['Listing Gains', 'Long-term Growth', 'Regular Income'], default: 'Listing Gains' },
    horizon: { type: String, enum: ['Short-term', 'Medium-term', 'Long-term'], default: 'Short-term' },
    preferredSectors: [{ type: String }],
    applicationSize: { type: String, enum: ['Retail (Min Lot)', 'Small HNI', 'Big HNI'], default: 'Retail (Min Lot)' }
  },
  createdAt: { type: Date, default: Date.now }
});

const bcrypt = require('bcryptjs');

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('securityAnswer')) {
      const salt = await bcrypt.genSalt(10);
      // Lowercase & trim for case-insensitive match later
      this.securityAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase().trim(), salt);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to verify security answer
userSchema.methods.compareSecurityAnswer = async function (candidateAnswer) {
  return await bcrypt.compare(candidateAnswer.toLowerCase().trim(), this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema);

