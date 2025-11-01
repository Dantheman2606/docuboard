# Offline Functionality for Document Editor

## Overview
The document editor now supports offline editing with automatic synchronization when the connection is restored.

## Features

### 1. **Automatic Online/Offline Detection**
- The app automatically detects when the user goes offline or comes back online
- Uses browser's native `navigator.onLine` and `online`/`offline` events

### 2. **Smart Data Persistence**
- **When Online**: Documents are fetched from the backend API and changes are immediately synced
- **When Offline**: 
  - Documents are saved to localStorage automatically
  - All edits (content and title) are marked as `pendingSync`
  - User can continue editing without interruption

### 3. **Automatic Sync on Reconnection**
- When the connection is restored, all pending changes are automatically synced to the backend
- The sync happens in the background without user intervention

### 4. **Visual Indicators**
- **Offline Mode**: Amber banner appears at the top of the editor
  - Shows: "You're offline. Changes will be saved locally and synced when you're back online."
- **Syncing Mode**: Blue banner appears when syncing pending changes
  - Shows: "Syncing changes to server..."

## Implementation Details

### Modified Files

1. **`documentStore.ts`**
   - Added `isOnline` state tracking
   - Added `pendingSync` flag to Document interface
   - Modified `updateDocumentContent` and `updateDocumentTitle` to check online status
   - Added `syncPendingDocuments()` function to sync all pending changes
   - All changes automatically saved to localStorage via Zustand persist middleware

2. **`DocumentEditor.tsx`**
   - Added visual offline/syncing indicators
   - Uses `isOnline` state from documentStore
   - Shows pending sync status

3. **`[pageId].tsx` (Document Page)**
   - Added online/offline event listeners
   - Modified document fetching logic:
     - Online: Fetch from backend API
     - Offline: Use localStorage data
   - Updates `isOnline` state in documentStore

## How It Works

### Normal Online Flow
```
1. User opens document
2. Document fetched from backend
3. User edits document
4. Changes immediately synced to backend
5. Changes also saved to localStorage (background)
```

### Offline Flow
```
1. User goes offline (or opens app while offline)
2. Document loaded from localStorage
3. User edits document
4. Changes saved to localStorage only
5. Changes marked with pendingSync flag
6. Offline banner displayed
```

### Reconnection Flow
```
1. Connection restored
2. Online event detected
3. syncPendingDocuments() automatically called
4. All documents with pendingSync flag sent to backend
5. pendingSync flags removed after successful sync
6. Syncing banner displayed briefly
7. Returns to normal online flow
```

## Testing the Offline Functionality

### Method 1: Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Edit a document - changes saved locally
5. Uncheck "Offline" - changes automatically sync

### Method 2: Browser Controls
1. In Chrome: Open DevTools > Network > Throttling dropdown > Offline
2. Edit document while offline
3. Switch back to "Online" - automatic sync occurs

### Method 3: Physical Network
1. Disconnect from WiFi/Network
2. Edit document
3. Reconnect to network
4. Changes automatically sync

## Error Handling

- If backend sync fails while online, the document is automatically marked as `pendingSync`
- Failed syncs are retried when `syncPendingDocuments()` is called
- Individual document sync failures are logged to console
- The app continues working normally even if some syncs fail

## Benefits

✅ **Seamless User Experience** - Users can work without interruption regardless of connection status
✅ **No Data Loss** - All changes are preserved in localStorage
✅ **Automatic Sync** - No manual intervention needed to sync changes
✅ **Minimal Code Complexity** - Uses existing Zustand persist middleware
✅ **Clear Feedback** - Visual indicators show connection and sync status
✅ **Smart Caching** - Only syncs changes that need syncing (pendingSync flag)

## Technical Notes

- localStorage is managed by Zustand's persist middleware
- Storage key: `document-storage`
- Online status is tracked globally in documentStore
- Sync is optimistic - UI updates immediately, backend syncs asynchronously
- All document operations (create, update, delete) respect online/offline status
