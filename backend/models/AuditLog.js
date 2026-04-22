const mongoose = require('mongoose');

// Audit log when head views user PII
const auditLogSchema = new mongoose.Schema({
  headId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  complaintId: { type: String, required: true },
  reason: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
