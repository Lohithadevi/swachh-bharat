const express = require('express');
const Complaint = require('../models/Complaint');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get assigned tasks for authority
router.get('/assigned', protect, requireRole('authority'), async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedTo: req.user.id,
      status: { $in: ['assigned', 'working'] }
    }).select('-likedBy').sort({ createdAt: -1 });
    res.json(complaints);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get completed tasks
router.get('/completed', protect, requireRole('authority'), async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedTo: req.user.id,
      status: { $in: ['acceptance_pending', 'completed', 'flagged'] }
    }).select('-likedBy').sort({ createdAt: -1 });
    res.json(complaints);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Mark work as started
router.post('/:id/start', protect, requireRole('authority'), async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id, assignedTo: req.user.id });
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (complaint.status !== 'assigned') return res.status(400).json({ message: 'Cannot start' });
    complaint.status = 'working';
    await complaint.save();
    res.json({ message: 'Marked as working' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Raise acceptance (work done)
router.post('/:id/complete', protect, requireRole('authority'), async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id, assignedTo: req.user.id });
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (complaint.status !== 'working') return res.status(400).json({ message: 'Work not started' });
    complaint.status = 'acceptance_pending';
    complaint.acceptanceRaisedAt = new Date();
    await complaint.save();
    res.json({ message: 'Acceptance raised' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
