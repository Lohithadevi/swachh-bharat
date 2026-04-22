const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const Flag = require('../models/Flag');

// Run every hour — check acceptance_pending complaints older than 7 days
const startScheduler = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const ignored = await Complaint.find({
        status: 'acceptance_pending',
        acceptanceRaisedAt: { $lt: sevenDaysAgo }
      });

      for (const complaint of ignored) {
        complaint.status = 'flagged';
        await complaint.save();

        const existing = await Flag.findOne({ complaintId: complaint.complaintId, type: 'user_ignored' });
        if (!existing) {
          await Flag.create({
            type: 'user_ignored',
            complaintId: complaint.complaintId,
            state: complaint.state,
            district: complaint.district,
            taluk: complaint.taluk
          });
        }
      }
    } catch (e) {
      console.error('Scheduler error:', e.message);
    }
  });
};

module.exports = startScheduler;
