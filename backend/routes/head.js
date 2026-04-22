const express = require('express');
const Complaint = require('../models/Complaint');
const Flag = require('../models/Flag');
const User = require('../models/User');
const UserComplaintMap = require('../models/UserComplaintMap');
const AuditLog = require('../models/AuditLog');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all complaints in head's jurisdiction
router.get('/complaints', protect, requireRole('head'), async (req, res) => {
  try {
    const { state, district, taluk } = req.user;
    const complaints = await Complaint.find({
      'headJurisdiction.state': state,
      'headJurisdiction.district': district,
      'headJurisdiction.taluk': taluk
    }).select('-likedBy').sort({ createdAt: -1 });
    res.json(complaints);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get flags in head's jurisdiction
router.get('/flags', protect, requireRole('head'), async (req, res) => {
  try {
    const { state, district, taluk } = req.user;
    const flags = await Flag.find({ state, district, taluk })
      .populate('authorityId', 'name email dept phone')
      .sort({ createdAt: -1 });

    // attach complaint photo + note to each flag
    const result = await Promise.all(flags.map(async (f) => {
      const complaint = await Complaint.findOne({ complaintId: f.complaintId }).select('photo note area issueType likes');
      return { ...f.toObject(), complaint: complaint || null };
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// View user info for a complaint (with reason — audit logged)
router.post('/view-user-info', protect, requireRole('head'), async (req, res) => {
  try {
    const { complaintId, reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason required' });

    const map = await UserComplaintMap.findOne({ complaintId });
    if (!map) return res.status(404).json({ message: 'Complaint not found' });

    const user = await User.findById(map.userId).select('name email phone');
    await AuditLog.create({ headId: req.user.id, complaintId, reason });

    res.json({ name: user.name, email: user.email, phone: user.phone });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Resolve a flag
router.post('/flags/:id/resolve', protect, requireRole('head'), async (req, res) => {
  try {
    const flag = await Flag.findByIdAndUpdate(req.params.id, { resolved: true }, { new: true });
    // mark the complaint as resolved by head
    await Complaint.findOneAndUpdate(
      { complaintId: flag.complaintId },
      { resolvedByHead: true, resolvedByHeadAt: new Date() }
    );
    res.json({ message: 'Flag resolved' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
