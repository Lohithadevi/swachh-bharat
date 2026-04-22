const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const UserComplaintMap = require('../models/UserComplaintMap');
const { protect, requireRole } = require('../middleware/auth');
const { sendNotification } = require('../utils/mailer');

const router = express.Router();

// Head: send message to authority (by userId)
router.post('/to-authority', protect, requireRole('head'), async (req, res) => {
  try {
    const { recipientId, content, complaintId } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const recipient = await User.findById(recipientId);
    if (!recipient || recipient.role !== 'authority')
      return res.status(404).json({ message: 'Authority not found' });

    const msg = await Message.create({
      senderId: req.user.id,
      recipientId,
      complaintId: complaintId || null,
      content: content.trim()
    });

    // email notification
    sendNotification(
      recipient.email,
      'New Message from Main Head — SwatchBharath Portal',
      `You have received a new message from the Main Head.<br><br>
       <strong>Message:</strong><br>${content.trim()}
       ${complaintId ? `<br><br><strong>Regarding Complaint:</strong> #${complaintId}` : ''}
       <br><br>Please login to the portal to view and respond.`
    ).catch(e => console.error('Mail error:', e.message));

    res.status(201).json({ message: 'Message sent', id: msg._id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Head: send message to citizen via complaintId (no PII needed)
router.post('/to-citizen', protect, requireRole('head'), async (req, res) => {
  try {
    const { complaintId, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const map = await UserComplaintMap.findOne({ complaintId });
    if (!map) return res.status(404).json({ message: 'Complaint not found' });

    const citizen = await User.findById(map.userId);
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });

    const msg = await Message.create({
      senderId: req.user.id,
      recipientId: citizen._id,
      complaintId,
      content: content.trim()
    });

    sendNotification(
      citizen.email,
      'New Message from Main Head — SwatchBharath Portal',
      `You have received a message from the Main Head regarding your complaint.<br><br>
       <strong>Complaint ID:</strong> #${complaintId}<br>
       <strong>Message:</strong><br>${content.trim()}
       <br><br>Please login to the portal to view the message.`
    ).catch(e => console.error('Mail error:', e.message));

    res.status(201).json({ message: 'Message sent', id: msg._id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get inbox for logged-in user (citizen or authority)
router.get('/inbox', protect, async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name role');
    res.json(messages);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Mark message as read
router.post('/:id/read', protect, async (req, res) => {
  try {
    await Message.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id },
      { read: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
