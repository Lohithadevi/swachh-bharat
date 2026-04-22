const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set in .env'); process.exit(1); }

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to:', mongoose.connection.db.databaseName);

  const db = mongoose.connection.db;

  await db.collection('users').deleteMany({ email: { $regex: '@demo.com' } });
  await db.collection('users').deleteMany({ role: 'authority', email: { $not: /@demo\.com$/ } });
  await db.collection('complaints').deleteMany({ complaintId: { $regex: '^DEMO-' } });
  await db.collection('usercomplaintmaps').deleteMany({ complaintId: { $regex: '^DEMO-' } });
  await db.collection('messages').deleteMany({ content: { $regex: 'Demo message' } });
  console.log('Cleared old demo data');

  const hash = await bcrypt.hash('demo1234', 10);

  const citizen1 = await db.collection('users').insertOne({
    name: 'Priya Citizen', email: 'citizen1@demo.com', password: hash,
    phone: '9876543210', role: 'citizen', isVerified: true,
    state: 'Tamil Nadu', district: 'Chennai', taluk: 'Adyar', createdAt: new Date()
  });

  const citizen2 = await db.collection('users').insertOne({
    name: 'Ravi Citizen', email: 'citizen2@demo.com', password: hash,
    phone: '9876543211', role: 'citizen', isVerified: true,
    state: 'Tamil Nadu', district: 'Chennai', taluk: 'Anna Nagar', createdAt: new Date()
  });

  const garbageAuth = await db.collection('users').insertOne({
    name: 'Garbage Authority', email: 'garbage@demo.com', password: hash,
    phone: '9876543212', role: 'authority', dept: 'garbage', isVerified: true,
    state: 'Tamil Nadu', district: 'Chennai', taluk: 'Adyar', createdAt: new Date()
  });

  const streetAuth = await db.collection('users').insertOne({
    name: 'Streetlight Authority', email: 'streetlight@demo.com', password: hash,
    phone: '9876543213', role: 'authority', dept: 'streetlight', isVerified: true,
    state: 'Tamil Nadu', district: 'Chennai', taluk: 'Anna Nagar', createdAt: new Date()
  });

  const head = await db.collection('users').insertOne({
    name: 'Main Head Chennai', email: 'head@demo.com', password: hash,
    phone: '9876543214', role: 'head', isVerified: true,
    state: 'Tamil Nadu', district: 'Chennai', taluk: 'Adyar', createdAt: new Date()
  });

  console.log('Demo users created');

  const now = new Date();
  const dueGarbage = new Date(now); dueGarbage.setDate(dueGarbage.getDate() + 4);
  const dueStreet = new Date(now); dueStreet.setDate(dueStreet.getDate() + 3);

  await db.collection('complaints').insertOne({
    complaintId: 'DEMO-001', state: 'Tamil Nadu', district: 'Chennai', taluk: 'Adyar',
    area: 'Near Bus Stand, Adyar', issueType: 'garbage',
    note: 'Overflowing garbage bin near the bus stand. Not cleared for 3 days.',
    status: 'working', assignedTo: garbageAuth.insertedId, assignedDept: 'garbage',
    dueDate: dueGarbage, likes: 5, likedBy: [citizen2.insertedId],
    headJurisdiction: { state: 'Tamil Nadu', district: 'Chennai', taluk: 'Adyar' },
    resolvedByHead: false, createdAt: new Date()
  });
  await db.collection('usercomplaintmaps').insertOne({ complaintId: 'DEMO-001', userId: citizen1.insertedId });

  await db.collection('complaints').insertOne({
    complaintId: 'DEMO-002', state: 'Tamil Nadu', district: 'Chennai', taluk: 'Anna Nagar',
    area: 'Main Road, Anna Nagar', issueType: 'streetlight',
    note: 'Street light not working for past week. Very dark at night.',
    status: 'acceptance_pending', assignedTo: streetAuth.insertedId, assignedDept: 'streetlight',
    dueDate: dueStreet, likes: 8, likedBy: [citizen1.insertedId],
    acceptanceRaisedAt: new Date(),
    headJurisdiction: { state: 'Tamil Nadu', district: 'Chennai', taluk: 'Anna Nagar' },
    resolvedByHead: false, createdAt: new Date()
  });
  await db.collection('usercomplaintmaps').insertOne({ complaintId: 'DEMO-002', userId: citizen2.insertedId });

  await db.collection('complaints').insertOne({
    complaintId: 'DEMO-003', state: 'Tamil Nadu', district: 'Chennai', taluk: 'Adyar',
    area: 'Gandhi Street, Adyar', issueType: 'garbage',
    note: 'Illegal dumping of construction waste on footpath.',
    status: 'completed', assignedTo: garbageAuth.insertedId, assignedDept: 'garbage',
    dueDate: dueGarbage, likes: 3, likedBy: [],
    headJurisdiction: { state: 'Tamil Nadu', district: 'Chennai', taluk: 'Adyar' },
    resolvedByHead: false, createdAt: new Date()
  });
  await db.collection('usercomplaintmaps').insertOne({ complaintId: 'DEMO-003', userId: citizen1.insertedId });

  await db.collection('complaints').insertOne({
    complaintId: 'DEMO-004', state: 'Tamil Nadu', district: 'Chennai', taluk: 'Anna Nagar',
    area: 'Park Avenue, Anna Nagar', issueType: 'streetlight',
    note: 'Broken pole causing safety hazard.',
    status: 'flagged', assignedTo: streetAuth.insertedId, assignedDept: 'streetlight',
    dueDate: dueStreet, likes: 12, likedBy: [citizen1.insertedId],
    rejectionNote: 'Pole still broken, only bulb was replaced.',
    headJurisdiction: { state: 'Tamil Nadu', district: 'Chennai', taluk: 'Anna Nagar' },
    resolvedByHead: true, resolvedByHeadAt: new Date(), createdAt: new Date()
  });
  await db.collection('usercomplaintmaps').insertOne({ complaintId: 'DEMO-004', userId: citizen2.insertedId });

  console.log('Demo complaints created');

  await db.collection('messages').insertOne({
    senderId: head.insertedId, recipientId: citizen2.insertedId,
    complaintId: 'DEMO-002',
    content: 'Demo message: Dear Citizen, we have noted your complaint regarding the street light at Anna Nagar. The authority has completed the work. Please verify and accept the resolution.',
    read: false, createdAt: new Date()
  });

  await db.collection('messages').insertOne({
    senderId: head.insertedId, recipientId: garbageAuth.insertedId,
    complaintId: 'DEMO-001',
    content: 'Demo message: Please ensure the garbage clearance at Adyar Bus Stand is completed within the stipulated time.',
    read: false, createdAt: new Date()
  });

  console.log('Demo messages created');

  // verify
  const count = await db.collection('users').countDocuments({ email: { $regex: '@demo.com' } });
  console.log('\nVerification — demo users in Atlas:', count);

  console.log('\n✅ Seed complete. Demo accounts:');
  console.log('  citizen1@demo.com    / demo1234');
  console.log('  citizen2@demo.com    / demo1234');
  console.log('  garbage@demo.com     / demo1234');
  console.log('  streetlight@demo.com / demo1234');
  console.log('  head@demo.com        / demo1234');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error('Seed error:', e.message); process.exit(1); });
