// migrate-project-codes.js
// Assigns unique 8-digit project codes to existing projects.

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env');
  process.exit(1);
}

const Project = require('./models/Project');

const generateCode = () => Math.floor(10000000 + Math.random() * 90000000).toString();

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const existingCodes = new Set(
    (await Project.find({ projectCode: { $exists: true, $ne: null } })
      .select('projectCode')
      .lean())
      .map((p) => p.projectCode)
  );

  const projects = await Project.find({
    $or: [
      { projectCode: { $exists: false } },
      { projectCode: null },
      { projectCode: '' },
    ],
  });

  let updated = 0;
  for (const project of projects) {
    let code = generateCode();
    let attempts = 0;
    while (existingCodes.has(code)) {
      code = generateCode();
      attempts += 1;
      if (attempts > 20) {
        throw new Error('Failed to generate a unique project code.');
      }
    }

    project.projectCode = code;
    await project.save();
    existingCodes.add(code);
    updated += 1;
  }

  console.log(`✅ Assigned codes for ${updated} project(s).`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
