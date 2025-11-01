# Document Versioning System

## Overview
A comprehensive version control system for document management with visual diff comparison and version restoration capabilities.

## Features

### ✅ Version Snapshots
- Automatic version creation with TipTap JSON serialization
- Metadata tracking: version number, timestamp, author, description
- Persistent storage in MongoDB

### ✅ Version History Panel
- Expandable sidebar in the top-right corner
- Real-time version list with metadata
- Quick actions: View Diff and Restore
- Relative timestamps (e.g., "2h ago", "3d ago")

### ✅ Visual Diff Viewer
- Side-by-side comparison using diff-match-patch
- Color-coded changes:
  - 🟢 Green = Additions
  - 🔴 Red = Deletions
- Character-level precision
- Addition/deletion statistics

### ✅ Version Restoration
- One-click restore to any previous version
- Confirmation dialog to prevent accidental restores
- Automatic content update in editor

### ✅ Manual Version Saving
- "Save Version" button in editor toolbar
- Automatic author attribution from logged-in user
- Timestamped descriptions

## Architecture

### Backend (Node.js + MongoDB)

#### Document Model (`models/Document.js`)
```javascript
{
  id: String,
  title: String,
  content: String (TipTap JSON),
  projectId: String,
  versions: [{
    versionNumber: Number,
    content: String (TipTap JSON),
    timestamp: Date,
    author: String,
    description: String
  }]
}
```

#### API Routes (`routes/documents.js`)
- `POST /api/documents/:id/versions` - Create new version
- `GET /api/documents/:id/versions` - List all versions
- `GET /api/documents/:id/versions/:versionNumber` - Get specific version
- `POST /api/documents/:id/versions/:versionNumber/restore` - Restore version

### Frontend (Next.js + TypeScript)

#### Components

**VersionHistory.tsx**
- Expandable panel component
- Version list with actions
- Loads versions on expansion
- Handles view/restore callbacks

**VersionDiff.tsx**
- Modal overlay for diff viewing
- TipTap JSON parser
- diff-match-patch integration
- Statistics display (additions/deletions)

**DocumentEditor.tsx**
- Integrated version controls
- Save version button
- Version history panel
- Diff viewer modal

#### API Client (`lib/api.ts`)
```typescript
interface DocumentVersion {
  versionNumber: number;
  content: string;
  timestamp: string;
  author: string;
  description: string;
}

api.createVersion(documentId, data)
api.getVersions(documentId)
api.getVersion(documentId, versionNumber)
api.restoreVersion(documentId, versionNumber)
```

## Usage

### Creating a Version
1. Open any document in the editor
2. Make changes to the content
3. Click "Save Version" button in the toolbar
4. Version is saved with automatic metadata

### Viewing Version History
1. Look for the "Version History" panel in top-right
2. Click to expand the panel
3. See list of all versions with details
4. Versions are sorted newest to oldest

### Comparing Versions
1. Open version history panel
2. Click "View" button on any version
3. Modal shows diff comparison
4. Green highlights = additions
5. Red strikethrough = deletions
6. Statistics show total changes

### Restoring a Version
1. Open version history panel
2. Click "Restore" button on desired version
3. Confirm restoration in dialog
4. Editor updates with restored content
5. Current content can be saved as new version

## Sample Data

The seed script (`seed.js`) includes sample documents with version history:

**Project Overview (d1)**
- Version 1: Initial project description
- Version 2: Added more context

**Design System (d2)**
- Version 1: Initial design guidelines

**API Documentation (d3)**
- Version 1: Initial API docs
- Version 2: Added base URL and authentication

## Technical Details

### TipTap JSON Serialization
Content is stored as TipTap JSON format:
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Title" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Content" }]
    }
  ]
}
```

### Diff Algorithm
- Uses Google's diff-match-patch library
- Efficient character-level diffing
- Semantic cleanup for readable diffs
- HTML rendering with inline styles

### Offline Support
- Versions require online connectivity
- Uses existing offline detection system
- Save button disabled when offline
- Graceful error handling

## Testing

### Login Credentials
Use any of these users to test:
- john_owner / password123
- jane_admin / password123
- bob_editor / password123
- alice_viewer / password123

### Test Scenarios

1. **View Existing Versions**
   - Login → Navigate to any document
   - Click Version History panel
   - See pre-seeded version history

2. **Create New Version**
   - Edit document content
   - Click "Save Version"
   - Verify version appears in history

3. **Compare Versions**
   - Click "View" on any version
   - Verify diff shows correctly
   - Check statistics are accurate

4. **Restore Version**
   - Click "Restore" on older version
   - Confirm restoration
   - Verify editor updates

5. **Multiple Versions**
   - Make several edits
   - Save version after each
   - Verify chronological ordering

## Benefits

✅ **Complete History** - Never lose previous work
✅ **Visual Comparison** - See exactly what changed
✅ **Easy Restoration** - One-click rollback
✅ **Team Collaboration** - Track who changed what
✅ **Audit Trail** - Full change history
✅ **No Data Loss** - All versions preserved

## Future Enhancements

Potential improvements:
- Branch/fork versions
- Version tags/labels
- Automatic version saving (e.g., every hour)
- Version comments/notes
- Compare any two versions (not just adjacent)
- Export version history
- Version search/filter
- Version merge capabilities

## Troubleshooting

**Versions not loading?**
- Check backend is running (port 5000)
- Verify document exists in database
- Check browser console for errors

**Diff not showing correctly?**
- Ensure version content is valid JSON
- Check TipTap JSON structure
- Verify diff-match-patch is installed

**Save button disabled?**
- Check online status
- Verify user is logged in
- Ensure document is loaded

## URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Base: http://localhost:5000/api

## Dependencies

### Frontend
- `diff-match-patch` - Diff algorithm
- `@types/diff-match-patch` - TypeScript types
- `@tiptap/react` - Rich text editor
- `@tanstack/react-query` - Data fetching

### Backend
- `diff-match-patch` - Diff utilities
- `mongoose` - MongoDB ODM
- `express` - Web framework

---

**Implementation Date**: November 2024
**Status**: ✅ Fully Operational
**Servers**: Frontend (3000) | Backend (5000)
