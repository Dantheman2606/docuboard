# Editor Structure & Collaboration Logic

## Rich Text Editor

### **TipTap Integration**
The editor is built on **TipTap 2.0**, a headless, framework-agnostic rich text editor built on ProseMirror. This provides a powerful foundation for collaborative editing.

### **Editor Extensions**
The editor uses multiple TipTap extensions to provide rich functionality:

- **Starter Kit** - Basic formatting (bold, italic, headings, lists, code blocks)
- **Text Style & Color** - Custom text styling and coloring
- **Underline** - Text underline formatting
- **Link** - URL link insertion and editing
- **Text Align** - Left, center, right, justify alignment
- **Highlight** - Text highlighting with colors
- **Font Family** - Multiple font options
- **Placeholder** - Empty editor placeholder text
- **Collaboration** - Multi-user editing via Yjs
- **Collaboration Cursor** - Real-time cursor positions
- **Custom Mention** - @mention functionality for team members

### **Editor Toolbar**
A comprehensive toolbar provides access to all formatting features:
- Text formatting (bold, italic, underline, code)
- Heading levels (H1, H2, H3)
- Lists (bullet, ordered)
- Text alignment
- Link insertion
- Color and highlight selection
- Font family selection
- Undo/Redo functionality

## Real-Time Collaboration

### **WebSocket-Based Collaboration**
The collaboration system uses **custom WebSocket implementation** for real-time multi-user editing.

**Key Benefits:**
- **Real-Time Synchronization** - Changes propagate instantly to all connected clients
- **Lightweight Protocol** - JSON-based messages for simplicity
- **Cursor Tracking** - See where other users are editing in real-time
- **User Presence** - Live list of active collaborators
- **Smart Conflict Handling** - Editor maintains cursor position during remote updates

### **Collaboration Flow**

```
User Types → TipTap Editor → Document Store (Zustand)
                                  ↓
                        WebSocket Connection
                                  ↓
                          Backend WebSocket Server
                          (ws://localhost:5000)
                                  ↓
                         Broadcast to All Clients
                                  ↓
                        Other User's WebSocket
                                  ↓
                      Update Editor Content (TipTap)
```

### **WebSocket Communication**
The application maintains persistent WebSocket connections for collaboration:

**Connection Lifecycle:**
1. Client opens WebSocket connection to `/collab` endpoint
2. Sends `join` message with documentId, userId, and userName
3. Server tracks all users in document "rooms"
4. Changes broadcast to all users in same document

**Message Types:**
- **`join`** - User joins document room
- **`content-update`** - Document content changed
- **`cursor-move`** - User cursor position changed
- **`users`** - Updated list of active collaborators

**Smart Update Handling:**
- Prevents feedback loops by tracking local vs remote updates
- Maintains cursor position during remote edits
- Throttles cursor position broadcasts (100ms) to reduce network traffic
- Automatically removes idle cursors after 3 seconds of inactivity

### **User Presence System**
The collaboration server tracks active users and broadcasts presence information:

- **User Join/Leave** - Real-time notification when users connect/disconnect
- **Active User List** - Display all collaborators with name and color
- **Color Assignment** - Consistent color per user based on userId hash
- **Connection Status** - Visual indicator of collaboration server connection

### **Remote Cursors**
Each collaborator is assigned a unique color, and their cursor position is visible to all other users in real-time.

**Implementation Details:**
- Document positions (character offsets) sent via WebSocket
- Client-side conversion from document position to screen coordinates
- Cursor position calculated using TipTap's `coordsAtPos()` method
- Real-time recalculation on scroll/resize events
- Automatic cleanup of idle cursors (>3 seconds without updates)
- Only shows cursors for actively typing users

**What's Displayed:**
- Cursor position indicator (colored vertical line)
- User name label above cursor
- Color-coded identification (consistent per user)
- Cursor automatically hidden when user stops typing

## Mention System

### **User Mentions**
The mention system allows tagging team members within documents using `@` syntax.

**Implementation:**
- **TipTap Suggestion Extension** - Provides autocomplete framework
- **Tippy.js** - Positions the mention dropdown
- **Dynamic Member Fetching** - Loads current project members
- **Keyboard Navigation** - Arrow keys and Enter for selection

**Flow:**
1. User types `@` in the editor
2. Dropdown appears with project members
3. Typing filters the member list
4. Selection inserts a mention node with user data
5. Mentions are highlighted and clickable

## Version History

### **Document Versioning**
Documents maintain version history for rollback capabilities.

**Features:**
- **Automatic Version Saving** - Periodic snapshots of document state
- **Version List** - View all historical versions with timestamps
- **Diff Visualization** - Compare versions using diff-match-patch algorithm
- **Rollback** - Restore previous versions (Owner/Admin only)

**Diff Display:**
- Additions shown in green
- Deletions shown in red
- Unchanged content in standard styling
- Line-by-line comparison view

## State Management

### **Document Store (Zustand)**
Manages document-related state with offline-first architecture:

**State Management:**
- Current active document
- Document list per project
- Online/offline status tracking
- Pending sync queue for offline edits

**Offline Support:**
- All changes saved to localStorage first (via Zustand persist)
- Backend sync attempted if online
- Failed syncs marked with `pendingSync` flag
- Automatic sync when connection restored
- Users can continue editing during network outages

**Persistence:**
- Zustand persist middleware for localStorage
- Documents persist across browser sessions
- Automatic sync on app restart if pending changes exist

### **React Query Integration**
Handles server state and caching:
- Automatic background refetching (5-minute stale time)
- 24-hour cache retention
- Optimistic updates for smooth UX
- Cache invalidation on mutations
- Persistent cache using `createSyncStoragePersister`
- Smart retry logic (doesn't retry on network errors, uses cache instead)

### **Collaboration State**
Managed through WebSocket and component state:
- Active collaborators list
- Remote cursor positions (Map of userId to cursor info)
- Connection status
- Real-time content synchronization

## Performance Optimizations

### **Code Splitting**
- Lazy loading of editor components
- Dynamic imports for large dependencies (TipTap extensions)
- Route-based code splitting with Next.js

### **Efficient Rendering**
- React memoization for expensive components
- Zustand's selective subscriptions prevent unnecessary re-renders
- TipTap's efficient ProseMirror reconciliation
- Editor key-based re-rendering only when selection changes

### **Caching Strategy**
- React Query caches server responses with intelligent stale time
- Persistent cache using localStorage (survives page refreshes)
- Stale-while-revalidate pattern for instant UI
- 24-hour cache retention

### **WebSocket Optimization**
- JSON message format for debugging simplicity
- Throttled cursor position updates (100ms delay)
- Idle cursor cleanup (removes cursors inactive >3 seconds)
- Smart update detection (only applies changes if content differs)
- Connection state management with automatic cleanup

### **Offline-First Architecture**
- All document changes saved to localStorage immediately
- Backend sync attempted asynchronously
- Failed syncs queued for retry when online
- Users never blocked by network issues
