# Offline Functionality Testing Guide

## Overview
This guide helps you test the offline functionality to ensure documents are properly saved to localStorage and synced when connection is restored.

## Test Scenarios

### Test 1: Go Offline While Editing
**Purpose:** Verify that edits are saved to localStorage when connection is lost

1. ✅ Open a document in the editor
2. ✅ Verify you're online (no amber banner)
3. ✅ Make some edits to the document (add text, change title)
4. ✅ **Go offline** using Chrome DevTools:
   - Press F12 to open DevTools
   - Go to Network tab
   - Check "Offline" checkbox
5. ✅ Verify amber banner appears: "You're offline. Changes will be saved locally..."
6. ✅ Make more edits to the document
7. ✅ Verify edits are still being saved (localStorage update happens automatically)
8. ✅ Check console for: `📴 Connection lost - switching to offline mode`

**Expected Result:** 
- Amber offline banner is visible
- All edits are saved immediately to localStorage
- Document remains fully functional

---

### Test 2: Page Refresh While Offline
**Purpose:** Verify that documents load from localStorage after refresh when offline

1. ✅ Following Test 1, while still offline with edited document
2. ✅ **Refresh the page** (F5 or Ctrl+R)
3. ✅ Check console for: `📴 Offline: Using localStorage`
4. ✅ Check console for: `📦 Document loaded from localStorage: [Document Name]`
5. ✅ Verify amber offline banner is still visible
6. ✅ Verify all your previous edits are still there
7. ✅ Make additional edits
8. ✅ Refresh again and verify edits persist

**Expected Result:**
- Document loads from localStorage without trying to fetch from backend
- All previous edits are preserved
- Document is fully editable
- Amber banner shows offline status

---

### Test 3: Return Online and Auto-Sync
**Purpose:** Verify that pending changes automatically sync when connection is restored

1. ✅ Following Test 2, while offline with pending changes
2. ✅ **Go back online**:
   - Uncheck "Offline" in DevTools Network tab
3. ✅ Check console for: `🌐 Connection restored - syncing pending documents`
4. ✅ Check console for sync progress:
   - `🔄 Syncing X pending document(s)...`
   - `📤 Syncing document: [Document Name]`
   - `✅ Successfully updated: [Document Name]`
   - `✅ Sync completed`
5. ✅ Verify blue "Syncing changes to server..." banner appears briefly
6. ✅ Verify amber offline banner disappears
7. ✅ Refresh the page (to verify backend has the data)
8. ✅ Check console for: `📡 Online: Fetching document from backend`
9. ✅ Verify document loads with all your offline edits

**Expected Result:**
- Automatic sync triggered when online
- Blue syncing banner shows briefly
- All offline changes are saved to backend
- No data loss

---

### Test 4: Start Offline (Fresh Page Load)
**Purpose:** Verify app works when opened while already offline

1. ✅ Close the browser tab
2. ✅ Go offline in DevTools
3. ✅ Open the application
4. ✅ Login (if localStorage has auth)
5. ✅ Navigate to a project
6. ✅ Open a document that was previously edited
7. ✅ Check console for: `📴 Offline: Using localStorage`
8. ✅ Verify document loads from localStorage
9. ✅ Make edits
10. ✅ Go online
11. ✅ Verify auto-sync occurs

**Expected Result:**
- App loads and works offline
- Previously cached documents are available
- All features work in offline mode
- Auto-sync works when connection restored

---

### Test 5: New Document While Offline
**Purpose:** Verify creating new documents while offline

1. ✅ Go offline
2. ✅ Navigate to a project
3. ✅ Create a new document
4. ✅ Verify document is created in localStorage
5. ✅ Edit the new document
6. ✅ Refresh page - verify document persists
7. ✅ Go online
8. ✅ Verify document syncs to backend
9. ✅ Check console for: `📝 Creating new document: [Document Name]`

**Expected Result:**
- New documents can be created offline
- They persist in localStorage
- They sync to backend when online

---

## Console Messages Reference

### localStorage Messages (Always Active)
- `💾 Hydrating document store from localStorage...` - App startup
- `✅ Loaded X document(s) from localStorage` - Initial load
- `💾 Saving document to localStorage: [title]` - Document saved
- `💾 Saving content to localStorage: [title]` - Content saved
- `💾 Saving title to localStorage: [title]` - Title saved
- `💾 Creating new document in localStorage: [title]` - New doc created
- `📖 Reading from localStorage: document-storage` - Data read

### Online Messages
- `📡 Online: Fetching document from backend` - Fetching fresh data
- `✅ Document fetched from backend: [title]` - Successfully loaded
- `🌐 Connection restored - syncing pending documents` - Sync triggered
- `☁️ Attempting backend sync: [title]` - Trying to sync

### Offline Messages
- `📴 Connection lost - switching to offline mode` - Gone offline
- `📴 Offline: Using localStorage` - Using cached data
- `📦 Document loaded from localStorage: [title]` - Loaded from cache
- `⚠️ Document not in localStorage, creating placeholder` - New doc offline
- `📴 Offline: Content saved to localStorage only` - Edit while offline
- `📴 Offline: Title saved to localStorage only` - Title change offline

### Sync Messages
- `🔄 Syncing X pending document(s)...` - Sync started
- `📤 Syncing document: [title]` - Syncing individual doc
- `✅ Successfully updated: [title]` - Update succeeded
- `📝 Creating new document: [title]` - Creating new doc
- `✅ Sync completed` - All syncs done
- `❌ Failed to sync document [title]` - Sync error
- `❌ Backend sync failed (content), keeping in localStorage` - Sync failed but data safe
- `❌ Backend sync failed (title), keeping in localStorage` - Title sync failed but data safe

---

## Troubleshooting

### Document not loading offline
1. Check browser console for errors
2. Verify localStorage is enabled in browser
3. Check Application tab in DevTools > Local Storage > Check for `document-storage` key
4. Run `checkDocumentStorage()` in browser console to see what's stored
5. Verify the document was previously loaded while online

### Changes not syncing
1. Check console for sync errors
2. Verify backend server is running
3. Check network requests in DevTools
4. Verify document has `pendingSync: true` flag in localStorage
5. Run `checkDocumentStorage()` to see pending sync documents

### Backend Server Not Running
**This is OK!** The app will:
1. Still save all changes to localStorage
2. Mark all changes as `pendingSync: true`
3. Continue working fully offline
4. Automatically sync when backend is started and you go online

### Checking localStorage Status
Run in browser console:
```javascript
checkDocumentStorage()
```
This will show:
- Number of documents stored
- Size of localStorage data
- Online/offline status
- All document details

### Infinite re-renders
1. Check console for repeated log messages
2. This should be fixed - report if it occurs
3. Clear localStorage and try again

---

## Manual Verification Checklist

✅ **Offline Mode**
- [ ] Amber banner shows when offline
- [ ] Document edits save to localStorage
- [ ] Page refresh loads from localStorage
- [ ] No backend requests made while offline

✅ **Online Mode**
- [ ] No offline banner when online
- [ ] Documents fetch from backend
- [ ] Changes sync immediately
- [ ] Blue banner shows during sync

✅ **Transition: Online → Offline**
- [ ] Status detected immediately
- [ ] Banner changes to amber
- [ ] Existing edits preserved
- [ ] New edits save locally

✅ **Transition: Offline → Online**
- [ ] Status detected immediately
- [ ] Auto-sync triggered
- [ ] Blue syncing banner shows
- [ ] All pending changes uploaded
- [ ] Banner disappears after sync

✅ **Data Persistence**
- [ ] Changes persist across page refreshes
- [ ] Changes persist across offline/online transitions
- [ ] No data loss in any scenario
- [ ] Backend receives all changes when synced

---

## Technical Notes

### localStorage Key
- Key name: `document-storage`
- Contains: All documents with metadata
- Includes: `pendingSync` flags for documents needing sync

### State Management
- Online/offline status tracked in `documentStore`
- Browser events: `online` and `offline` 
- Zustand persist middleware handles localStorage automatically

### Fetch Logic
- Online: Always fetch from backend first
- Offline: Always use localStorage
- On transition: Appropriate fetch method used
- Refs prevent infinite loops

### How localStorage Persistence Works

**CRITICAL: Documents are ALWAYS saved to localStorage, regardless of online status!**

1. **Every document change:**
   ```
   User types → State updates → Zustand persist middleware → localStorage
   ```

2. **Backend sync is separate and asynchronous:**
   ```
   User types → Save to localStorage (instant) → Try backend sync (background)
   ```

3. **If backend sync fails:**
   - Document is ALREADY safely in localStorage
   - `pendingSync` flag is set to `true`
   - Document will sync later when connection is restored

4. **This means:**
   - ✅ Backend can be down and app still works
   - ✅ You can go offline mid-edit with no data loss
   - ✅ Page refreshes always work (data in localStorage)
   - ✅ Multiple devices can work offline independently

### Backend Connection Status
The app handles three states:
1. **Online + Backend Running** → Live sync, no pending changes
2. **Online + Backend Down** → localStorage works, marked as pending
3. **Offline** → localStorage only, marked as pending

All three states preserve your data!
