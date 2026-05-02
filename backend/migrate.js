// migrate.js
// Normalizes user emails only:
//   - keeps `email`
//   - removes `email_id` and `emailId`
//   - ensures `.com` emails; falls back to username-based email

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env');
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;

  const isValidComEmail = (value) => {
    if (!value || typeof value !== 'string') return false;
    const normalized = value.trim().toLowerCase();
    if (!normalized.endsWith('.com')) return false;
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized);
  };

  const buildEmailFromUsername = (username) => {
    const normalized = (username || '').toString().trim().toLowerCase();
    if (!normalized) return null;
    return `${normalized}@docuboard.com`;
  };

  // ─────────────────────────────────────────────
  // Normalize user emails (keep only `email`)
  // ─────────────────────────────────────────────
  console.log('\n📧 Normalizing user emails...');
  const users = await db.collection('users').find({}).toArray();
  let emailUpdates = 0;
  for (const user of users) {
    const candidates = [user.email, user.email_id, user.emailId].filter(Boolean);
    const validCandidate = candidates.find((value) => isValidComEmail(value));
    const fallbackEmail = buildEmailFromUsername(user.username);
    const resolvedEmail = (validCandidate || fallbackEmail || '').trim().toLowerCase();

    const update = { $unset: {} };
    if (user.email_id !== undefined) update.$unset.email_id = '';
    if (user.emailId !== undefined) update.$unset.emailId = '';

    if (resolvedEmail && user.email !== resolvedEmail) {
      update.$set = { email: resolvedEmail };
    }

    if (update.$set || Object.keys(update.$unset).length) {
      await db.collection('users').updateOne({ _id: user._id }, update);
      emailUpdates++;
    }
  }
  console.log(`   ✔ Normalized email(s) for ${emailUpdates} user(s).`);

  // Done
  console.log('\n✅ Migration complete!');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
