const express = require('express');
const multer = require('multer');
const path = require('path');
const Complaint = require('../models/Complaint');
const UserComplaintMap = require('../models/UserComplaintMap');
const { protect, requireRole } = require('../middleware/auth');
const { getDueDate, generateComplaintId } = require('../utils/autoAssign');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Public: get all complaints (no user info) — auth optional for likedByMe
router.get('/public', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .select('-assignedTo')
      .sort({ createdAt: -1 });

    // check if logged-in user already liked each complaint
    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {}
    }

    const result = complaints.map(c => ({
      ...c.toObject(),
      likedByMe: userId ? c.likedBy.map(id => id.toString()).includes(userId) : false,
      likedBy: undefined
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Citizen: create complaint
router.post('/', protect, requireRole('citizen'), upload.single('photo'), async (req, res) => {
  try {
    const { state, district, taluk, area, issueType, note } = req.body;
    const complaintId = generateComplaintId();
    const dueDate = getDueDate(issueType);

    const complaint = await Complaint.create({
      complaintId,
      state, district, taluk, area,
      issueType,
      note,
      photo: req.file ? req.file.filename : null,
      assignedDept: issueType,
      dueDate,
      headJurisdiction: { state, district, taluk },
      status: 'submitted'
    });

    await UserComplaintMap.create({ complaintId, userId: req.user.id });

    // Auto-assign to authority matching dept + location
    const authority = await User.findOne({
      role: 'authority',
      dept: issueType,
      state, district, taluk
    });

    if (authority) {
      complaint.assignedTo = authority._id;
      complaint.status = 'assigned';
      await complaint.save();
      console.log(`Complaint ${complaintId} assigned to ${authority.name}`);
    } else {
      console.log(`No authority found for dept=${issueType} state=${state} district=${district} taluk=${taluk}`);
    }

    res.status(201).json({ message: 'Complaint submitted', complaintId });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Citizen: get own complaints for tracking
router.get('/my', protect, requireRole('citizen'), async (req, res) => {
  try {
    const maps = await UserComplaintMap.find({ userId: req.user.id });
    const ids = maps.map(m => m.complaintId);
    const complaints = await Complaint.find({ complaintId: { $in: ids } }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Citizen: like a complaint
router.post('/:id/like', protect, requireRole('citizen'), async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (complaint.likedBy.includes(req.user.id))
      return res.status(400).json({ message: 'Already liked' });
    complaint.likedBy.push(req.user.id);
    complaint.likes += 1;
    await complaint.save();
    res.json({ likes: complaint.likes });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Citizen: accept or reject completion
router.post('/:id/respond', protect, requireRole('citizen'), upload.single('rejectionPhoto'), async (req, res) => {
  try {
    const { action, rejectionNote } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (complaint.status !== 'acceptance_pending')
      return res.status(400).json({ message: 'No pending acceptance' });

    if (action === 'accept') {
      complaint.status = 'completed';
      await complaint.save();
      return res.json({ message: 'Accepted' });
    }

    if (action === 'reject') {
      const Flag = require('../models/Flag');
      complaint.status = 'flagged';
      complaint.rejectionNote = rejectionNote;
      complaint.rejectionPhoto = req.file ? req.file.filename : null;
      await complaint.save();

      await Flag.create({
        type: 'authority_rejected',
        complaintId: complaint.complaintId,
        authorityId: complaint.assignedTo,
        authorityDept: complaint.assignedDept,
        rejectionNote,
        rejectionPhoto: req.file ? req.file.filename : null,
        state: complaint.state,
        district: complaint.district,
        taluk: complaint.taluk
      });

      return res.json({ message: 'Rejected and flagged' });
    }

    res.status(400).json({ message: 'Invalid action' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
