const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.MONGO_URI;
if (!URI) { console.error('MONGO_URI not set'); process.exit(1); }

mongoose.connect(URI).then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({ email: { $regex: '@demo.com' } }).toArray();
  console.log('Demo users found:', users.length);
  users.forEach(u => console.log(' -', u.email, u.role, 'verified:', u.isVerified));
  console.log('DB name:', db.databaseName);
  process.exit(0);
}).catch(e => { console.log('ERR:', e.message); process.exit(1); });
