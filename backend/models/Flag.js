const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  type: { type: String, enum: ['user_ignored', 'authority_rejected'], required: true },
  complaintId: { type: String, required: true },

  // for authority_rejected: which authority dept was flagged
  authorityId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  authorityDept: { type: String },

  rejectionNote: { type: String },
  rejectionPhoto: { type: String },

  // jurisdiction so head can filter
  state: { type: String },
  district: { type: String },
  taluk: { type: String },

  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flag', flagSchema);
