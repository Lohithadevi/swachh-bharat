const mongoose = require('mongoose');

// Maps complaintId to userId — only accessible by head
const userComplaintMapSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('UserComplaintMap', userComplaintMapSchema);
