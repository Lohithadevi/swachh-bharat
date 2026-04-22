const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },

  // location
  state: { type: String, required: true },
  district: { type: String, required: true },
  taluk: { type: String, required: true },
  area: { type: String, required: true },

  issueType: { type: String, enum: ['garbage', 'streetlight'], required: true },
  note: { type: String },
  photo: { type: String }, // filename

  status: {
    type: String,
    enum: ['submitted', 'assigned', 'working', 'acceptance_pending', 'completed', 'flagged'],
    default: 'submitted'
  },

  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedDept: { type: String },
  dueDate: { type: Date },

  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  acceptanceRaisedAt: { type: Date },
  rejectionNote: { type: String },
  rejectionPhoto: { type: String },
  resolvedByHead: { type: Boolean, default: false },
  resolvedByHeadAt: { type: Date },

  headJurisdiction: {
    state: String,
    district: String,
    taluk: String
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);
