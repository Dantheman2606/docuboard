// migrate.js
// Migrates legacy DocuBoard data:
//   1. Re-hash plain-text user passwords using bcrypt
//   2. Convert string `id` field IDs → rely on MongoDB _id (removes orphaned string id fields)
//   3. Migrate KanbanBoard embedded cards → Card collection
//   4. Convert string foreign-key refs → ObjectId refs

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env');
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;

  // ─────────────────────────────────────────────
  // 0. Drop legacy unique indexes on old string `id` fields
  // ─────────────────────────────────────────────
  console.log('\n🗑️  Phase 0: Dropping legacy string id indexes...');
  const collectionsToFix = ['projects', 'documents', 'kanbanboards', 'activities', 'notifications'];
  for (const colName of collectionsToFix) {
    try {
      const col = db.collection(colName);
      const indexes = await col.indexes();
      for (const idx of indexes) {
        if (idx.key && idx.key.id !== undefined && idx.name !== '_id_') {
          await col.dropIndex(idx.name);
          console.log(`   Dropped index "${idx.name}" from ${colName}`);
        }
      }
    } catch (e) {
      console.log(`   Skipped ${colName}: ${e.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // 1. Hash plain-text passwords
  // ─────────────────────────────────────────────
  console.log('\n🔐 Phase 1: Hashing plain-text passwords...');
  const users = await db.collection('users').find({}).toArray();
  let hashCount = 0;
  for (const user of users) {
    // Bcrypt hashes always start with $2b$ or $2a$
    const alreadyHashed = user.password && (user.password.startsWith('$2b$') || user.password.startsWith('$2a$'));
    if (!alreadyHashed && user.password) {
      const hashed = await bcrypt.hash(user.password, 12);
      await db.collection('users').updateOne({ _id: user._id }, { $set: { password: hashed } });
      hashCount++;
    }
  }
  console.log(`   ✔ Hashed ${hashCount} password(s). ${users.length - hashCount} were already hashed.`);

  // ─────────────────────────────────────────────
  // 2. Migrate Projects: remove string `id` field, convert docs array
  // ─────────────────────────────────────────────
  console.log('\n📁 Phase 2: Cleaning up Project string IDs...');
  const projects = await db.collection('projects').find({}).toArray();
  let projectUpdates = 0;
  for (const project of projects) {
    const update = { $unset: {} };
    if (project.id) update.$unset.id = '';  // remove custom string id
    if (project.docs && Array.isArray(project.docs)) {
      // Convert string doc IDs in docs[] to ObjectId refs if they look like ObjectIds
      const newDocs = project.docs.map((d) => {
        try { return new mongoose.Types.ObjectId(d); }
        catch { return null; }
      }).filter(Boolean);
      update.$set = { docs: newDocs };
    }
    if (update.$unset.id || update.$set) {
      await db.collection('projects').updateOne({ _id: project._id }, update);
      projectUpdates++;
    }
  }
  console.log(`   ✔ Updated ${projectUpdates} project(s).`);

  // ─────────────────────────────────────────────
  // 3. Migrate Documents: remove string `id`, convert projectId
  // ─────────────────────────────────────────────
  console.log('\n📄 Phase 3: Migrating Documents...');
  const documents = await db.collection('documents').find({}).toArray();
  // Build project string-id → _id map
  const projectIdMap = {};
  for (const p of projects) {
    if (p.id) projectIdMap[p.id] = p._id;
  }
  let docUpdates = 0;
  for (const doc of documents) {
    const update = {};
    if (doc.id) update.$unset = { id: '' };

    // Convert projectId string → ObjectId
    if (doc.projectId && typeof doc.projectId === 'string') {
      const mappedId = projectIdMap[doc.projectId];
      if (mappedId) {
        update.$set = { ...(update.$set || {}), projectId: mappedId };
      } else {
        // Try direct ObjectId parse
        try {
          update.$set = { ...(update.$set || {}), projectId: new mongoose.Types.ObjectId(doc.projectId) };
        } catch (_) {}
      }
    }

    if (update.$unset || update.$set) {
      await db.collection('documents').updateOne({ _id: doc._id }, update);
      docUpdates++;
    }
  }
  console.log(`   ✔ Updated ${docUpdates} document(s).`);

  // ─────────────────────────────────────────────
  // 4. Migrate KanbanBoards: remove string `id`, convert projectId, extract cards
  // ─────────────────────────────────────────────
  console.log('\n🗂️  Phase 4: Migrating KanbanBoards and extracting Cards...');
  const boards = await db.collection('kanbanboards').find({}).toArray();
  const boardIdMap = {};  // string id → _id

  let boardUpdates = 0;
  let cardsCreated = 0;

  for (const board of boards) {
    if (board.id) boardIdMap[board.id] = board._id;

    const update = {};
    if (board.id) update.$unset = { id: '' };

    // Convert projectId
    if (board.projectId && typeof board.projectId === 'string') {
      const mappedId = projectIdMap[board.projectId];
      if (mappedId) {
        update.$set = { ...(update.$set || {}), projectId: mappedId };
      } else {
        try { update.$set = { ...(update.$set || {}), projectId: new mongoose.Types.ObjectId(board.projectId) }; }
        catch (_) {}
      }
    }

    // Extract embedded cards map → Card collection
    if (board.cards && typeof board.cards === 'object') {
      const cardsMap = board.cards instanceof Map ? Object.fromEntries(board.cards) : board.cards;
      const columnCardIdMap = {}; // old card string key → new Card _id

      for (const [cardKey, cardData] of Object.entries(cardsMap)) {
        // Find which column this card belongs to
        let columnId = 'todo';
        if (board.columns) {
          const colMap = board.columns instanceof Map ? Object.fromEntries(board.columns) : board.columns;
          for (const [colKey, col] of Object.entries(colMap)) {
            if (col && Array.isArray(col.cardIds) && col.cardIds.includes(cardKey)) {
              columnId = colKey;
              break;
            }
          }
        }

        // Check if card already migrated
        const existingCard = await db.collection('cards').findOne({ _legacyId: cardKey, boardId: board._id });
        let cardObjId;
        if (existingCard) {
          cardObjId = existingCard._id;
        } else {
          const cardDoc = {
            title: cardData.title || 'Untitled',
            description: cardData.description || '',
            assigneeName: cardData.assignee || '',
            labels: cardData.labels || [],
            dueDate: cardData.dueDate ? new Date(cardData.dueDate) : null,
            boardId: board._id,
            columnId,
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            _legacyId: cardKey,  // keep for deduplication; can remove after migration
          };
          const result = await db.collection('cards').insertOne(cardDoc);
          cardObjId = result.insertedId;
          cardsCreated++;
        }
        columnCardIdMap[cardKey] = cardObjId;
      }

      // Rebuild columns with ObjectId cardIds
      const columns = board.columns instanceof Map ? Object.fromEntries(board.columns) : (board.columns || {});
      const newColumns = {};
      for (const [colKey, col] of Object.entries(columns)) {
        const newCardIds = (col.cardIds || []).map((cid) => columnCardIdMap[cid]).filter(Boolean);
        newColumns[colKey] = { id: col.id || colKey, title: col.title, cardIds: newCardIds };
      }
      update.$set = { ...(update.$set || {}), columns: newColumns };
      update.$unset = { ...(update.$unset || {}), cards: '' }; // remove embedded cards
    }

    if (update.$unset || update.$set) {
      await db.collection('kanbanboards').updateOne({ _id: board._id }, update);
      boardUpdates++;
    }
  }
  console.log(`   ✔ Updated ${boardUpdates} board(s), created ${cardsCreated} card(s).`);

  // ─────────────────────────────────────────────
  // 5. Migrate Activities: remove string `id`, convert refs
  // ─────────────────────────────────────────────
  console.log('\n📊 Phase 5: Migrating Activities...');
  const activities = await db.collection('activities').find({}).toArray();
  let activityUpdates = 0;
  for (const activity of activities) {
    const update = {};
    if (activity.id) update.$unset = { id: '' };

    const $set = {};
    if (activity.projectId && typeof activity.projectId === 'string') {
      const mapped = projectIdMap[activity.projectId];
      if (mapped) $set.projectId = mapped;
      else try { $set.projectId = new mongoose.Types.ObjectId(activity.projectId); } catch (_) {}
    }
    if (activity.boardId && typeof activity.boardId === 'string') {
      const mapped = boardIdMap[activity.boardId];
      if (mapped) $set.boardId = mapped;
      else try { $set.boardId = new mongoose.Types.ObjectId(activity.boardId); } catch (_) {}
    }
    if (Object.keys($set).length) update.$set = { ...(update.$set || {}), ...$set };

    if (update.$unset || update.$set) {
      await db.collection('activities').updateOne({ _id: activity._id }, update);
      activityUpdates++;
    }
  }
  console.log(`   ✔ Updated ${activityUpdates} activity record(s).`);

  // ─────────────────────────────────────────────
  // 6. Migrate Notifications: remove string `id`, convert userId
  // ─────────────────────────────────────────────
  console.log('\n🔔 Phase 6: Migrating Notifications...');
  const userObjectIdMap = {};
  for (const u of users) { if (u._id) userObjectIdMap[u._id.toString()] = u._id; }

  const notifications = await db.collection('notifications').find({}).toArray();
  let notifUpdates = 0;
  for (const notif of notifications) {
    const update = {};
    if (notif.id) update.$unset = { id: '' };

    const $set = {};
    if (notif.userId && typeof notif.userId === 'string') {
      const mapped = userObjectIdMap[notif.userId];
      if (mapped) $set.userId = mapped;
      else try { $set.userId = new mongoose.Types.ObjectId(notif.userId); } catch (_) {}
    }
    if (Object.keys($set).length) update.$set = $set;

    if (update.$unset || update.$set) {
      await db.collection('notifications').updateOne({ _id: notif._id }, update);
      notifUpdates++;
    }
  }
  console.log(`   ✔ Updated ${notifUpdates} notification(s).`);

  // Done
  console.log('\n✅ Migration complete!');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
