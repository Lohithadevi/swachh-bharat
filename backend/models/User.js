const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['citizen', 'authority', 'head'], default: 'citizen' },
  isVerified: { type: Boolean, default: false },

  // authority fields
  dept: { type: String, enum: ['garbage', 'streetlight', null], default: null },

  // head & authority jurisdiction
  state: { type: String },
  district: { type: String },
  taluk: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
