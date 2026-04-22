const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/authority', require('./routes/authority'));
app.use('/api/head', require('./routes/head'));
app.use('/api/messages', require('./routes/messages'));

// Serve React frontend in production
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuild));
app.get('*splat', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    const User = require('./models/User');
    const Complaint = require('./models/Complaint');
    const unassigned = await Complaint.find({ status: 'submitted', assignedTo: null });
    for (const c of unassigned) {
      const auth = await User.findOne({ role: 'authority', dept: c.issueType, state: c.state, district: c.district, taluk: c.taluk });
      if (auth) {
        c.assignedTo = auth._id;
        c.status = 'assigned';
        await c.save();
        console.log(`Re-assigned ${c.complaintId} to ${auth.name}`);
      }
    }

    require('./utils/scheduler')();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
