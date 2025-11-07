# Features & Implementation

## 1. Authentication & Authorization

### **Authentication System**
User authentication is handled using simple session-based authentication with localStorage.

**Implementation:**
- Login/signup forms with client-side validation
- User data stored in localStorage (no JWT tokens)
- Plain password comparison on backend (simplified for demo)
- Fetch API with custom wrapper for offline detection
- Automatic offline/online status detection
- Protected routes using client-side checks
- Automatic redirect on unauthorized access

**Authentication Flow:**
1. User submits credentials via login/signup form
2. Backend validates credentials (username/password)
3. Backend returns user object (id, username, name, role)
4. Frontend stores user object in localStorage
5. User data persists across sessions

**API Layer:**
- Custom fetch wrapper (`fetchWithOfflineDetection`)
- Automatic detection of connection errors
- Sets offline status on network failures
- No authentication headers (stateless demo app)
- Base URL from environment variable

**Technologies:**
- Native Fetch API for HTTP requests
- Custom API client (`/lib/api.ts`)
- localStorage for user session persistence
- Zustand authStore for authentication state

### **Role-Based Access Control (RBAC)**
Four-tier permission system controlling user actions.

**Roles & Permissions:**
- **Owner** - Full control including member management and deletion
- **Admin** - Content management without project deletion
- **Editor** - Create and edit content
- **Viewer** - Read-only access

**Implementation:**
- Permission matrix defined in `usePermissions` hook
- Role hierarchy system (Owner > Admin > Editor > Viewer)
- Permission checks before sensitive operations
- UI elements conditionally rendered based on role
- Backend validation of all permissions
- `ProtectedAction` component for wrapping restricted actions
- `RoleIndicator` component showing user roles with icons
- Role management only by users with higher privileges



**Technologies:**
- Custom permission utilities in `usePermissions` hook
- Zustand authStore for role state
- React hooks for permission checking
- Component-level permission guards

## 2. Real-Time Collaborative Editor

### **Rich Text Editing**
Full-featured WYSIWYG editor with extensive formatting options.

**Features:**
- Text formatting (bold, italic, underline, strikethrough)
- Heading levels (H1-H6)
- Lists (bulleted, numbered)
- Code blocks and inline code
- Links with URL validation
- Text alignment (left, center, right, justify)
- Text colors and highlights
- Font family selection
- Blockquotes

**Implementation:**
- TipTap editor with custom extensions
- Custom toolbar with button components
- Keyboard shortcuts for common operations
- Modal dialogs for link insertion

**Technologies:**
- **TipTap** - Editor framework
- **ProseMirror** - Underlying editor engine
- **TipTap Extensions** - Modular functionality
- Radix UI Dialog for modals

### **Multi-User Collaboration**
Real-time synchronization allowing multiple users to edit simultaneously.

**Implementation:**
- WebSocket connection to collaboration server (`/collab` endpoint)
- Document "rooms" for isolating collaboration by document
- User join/leave tracking with room management
- Real-time content broadcasting to all users in same document
- Smart update detection to prevent unnecessary re-renders

**Message Flow:**
1. User opens document and establishes WebSocket connection
2. Client sends `join` message with documentId, userId, userName
3. Server adds user to document room and broadcasts user list
4. Local edits trigger `content-update` messages
5. Server broadcasts to all other users in same room
6. Remote changes merge into editor maintaining cursor position

**Conflict Prevention:**
- `isRemoteUpdate` flag prevents feedback loops
- `isLocalUpdate` flag prevents re-broadcasting own changes
- Content comparison before applying updates (only if different)
- Cursor position preservation during remote updates

**Technologies:**
- **Native WebSocket API** - Bidirectional real-time communication
- **TipTap Editor** - Content editing and rendering
- **JSON Protocol** - Simple message format for debugging
- **React State** - Managing connection and collaborators list

### **User Presence & Cursors**
Visual indicators of active collaborators with real-time cursor positions.

**Features:**
- Colored cursor indicators for each user
- User name labels above cursors
- Selection highlighting (future enhancement)
- Active user list with online status
- Automatic idle cursor removal

**Implementation:**
- WebSocket `cursor-move` messages with document position (character offset)
- Client-side coordinate conversion using TipTap's `coordsAtPos()`
- Real-time position recalculation on scroll/resize
- Map-based storage of cursor data (userId → cursor info)
- Periodic cleanup of idle cursors (>3 seconds without updates)
- Smart cursor visibility (only shown for actively typing users)



**Performance Optimizations:**
- Throttled cursor broadcasts (100ms delay)
- RequestAnimationFrame for smooth position updates
- Automatic removal of stale cursors
- Only visible for users who edited in last 3 seconds

**Technologies:**
- WebSocket for position broadcasting
- TipTap's `coordsAtPos()` for position calculation
- React state (Map) for cursor tracking
- CSS absolute positioning for cursor rendering

### **Mention System**
Tag team members within documents for notifications and references.

**Implementation:**
- Custom TipTap mention extension
- Autocomplete dropdown with member search
- Keyboard navigation (arrow keys, Enter, Escape)
- Click to mention insertion
- Styled mention nodes in document

**Flow:**
1. User types `@` character
2. Suggestion dropdown appears
3. Filter members by typing
4. Select member with keyboard or mouse
5. Mention node inserted with user data

**Technologies:**
- **TipTap Suggestion Extension** - Autocomplete framework
- **Tippy.js** - Dropdown positioning
- React Query for member data fetching

## 3. Kanban Board Management

### **Drag-and-Drop Interface**
Intuitive card management with drag-and-drop functionality.

**Features:**
- Multiple boards per project
- Customizable columns
- Draggable cards
- Card creation and editing
- Card deletion
- Real-time updates across users

**Implementation:**
- Board and column data structure
- Card components with edit/delete actions
- Drag-and-drop event handlers
- Optimistic updates for smooth UX
- Server synchronization on drop

**Technologies:**
- **@hello-pangea/dnd** - Drag-and-drop library (React-beautiful-dnd fork)
- Zustand for kanban state management
- React Query for server synchronization

### **Real-Time Kanban Sync**
Changes to boards propagate to all users instantly.

**Implementation:**
- WebSocket events for board updates
- Store updates trigger re-renders
- Optimistic UI updates before server confirmation
- Rollback on server errors

**Flow:**
1. User drags card to new position
2. UI updates immediately (optimistic)
3. Mutation sent to server
4. Server broadcasts update to other clients
5. Other clients receive and update their view

## 4. Activity Tracking & Notifications

### **Activity Feed**
Real-time feed of all project activities with automatic polling.

**Features:**
- Document creation/updates
- Kanban board changes (cards moved, created, deleted)
- Member additions/removals
- Timestamped activity entries
- User attribution for actions
- Activity icons based on action type
- Relative time display ("2h ago", "just now")

**Implementation:**
- Backend activity logging for all significant actions
- React Query with 10-second refetch interval when feed is open
- Activity feed component as sliding panel
- Manual refresh on panel open
- Time formatting with relative timestamps
- Icon mapping for different activity types

**Activity Types:**
- `card_created`, `card_updated`, `card_moved`, `card_deleted`
- `board_created`, `board_updated`, `board_deleted`
- `document_created`, `document_updated`, `document_deleted`
- Each with corresponding Lucide icon

**Technologies:**
- React Query for data fetching (polling)
- Lucide icons for activity types
- ScrollArea component for list
- Custom time formatting utilities

### **Notification System**
In-app notifications for important events with real-time polling.

**Features:**
- Unread notification count badge
- Notification panel with list
- Mark as read functionality
- Click to navigate to related content
- Real-time toast notifications

**Implementation:**
- NotificationProvider wraps authenticated routes
- React Query polling (10-second interval)
- Backend creates notifications for significant events
- Custom `useNotifications` hook manages polling and toasts
- Toast notifications for immediate user feedback

**Technologies:**
- **React Hot Toast** for toast notifications
- **React Query** for polling notification data
- Custom hooks for notification management
- Lucide icons for notification types

## 5. Project & Member Management

### **Multi-Project Support**
Users can create and participate in multiple projects.

**Features:**
- Project creation with automatic Owner role
- Project listing and navigation
- Project-specific workspaces
- Project deletion (Owner only)

**Implementation:**
- Project store for current project state
- URL routing per project (`/projects/[id]`)
- Sidebar for project navigation
- Context persistence across page navigation

**Technologies:**
- Next.js dynamic routing
- Zustand for UI state
- React Query for project data


## 6. Version Control

### **Document Version History**
Track changes and rollback to previous versions.

**Features:**
- Automatic version snapshots
- Version list with timestamps
- Diff view comparing versions
- Rollback to previous version (Owner/Admin)

**Implementation:**
- Backend stores document snapshots
- Frontend fetches version history
- Diff algorithm compares text
- Color-coded diff display (green/red)
- Rollback sends restore request

**Technologies:**
- **diff-match-patch** - Text diffing algorithm
- React components for diff visualization
- React Query for version data

## 7. State Management Strategy

### **Zustand Stores**
Lightweight global state for client-side data with persistence.

**Stores:**
- `documentStore` - Documents, content, offline sync queue
- `kanbanStore` - Kanban boards, columns, and cards
- `presenceStore` - User presence (if implemented)
- `uiStore` - Sidebar state, current project, UI preferences
- `authStore` - User authentication state and role

**Features:**
- Zustand persist middleware for localStorage
- Offline-first architecture (documents)
- Pending sync tracking for offline edits
- Automatic sync on connection restoration

**Benefits:**
- Minimal boilerplate compared to Redux
- Full TypeScript support
- Built-in devtools integration
- Selective subscriptions prevent unnecessary re-renders
- Simple API (hooks-based)

### **React Query**
Server state management with intelligent caching and persistence.

**Features:**
- Automatic background refetching (5-minute stale time)
- Cache invalidation on mutations
- Optimistic updates for instant feedback
- Persistent cache across sessions (localStorage)
- Smart retry logic (skips retry on network errors)
- Loading and error states automatically managed
- 24-hour cache retention (gcTime)

**Configuration:**
- `staleTime: 5 minutes` - Data considered fresh for 5 minutes
- `gcTime: 24 hours` - Unused cache kept for 24 hours
- `PersistQueryClientProvider` - Survives page refreshes
- Connection-aware retry (uses cache on network errors)

**Use Cases:**
- Fetching projects, documents, boards
- User authentication state
- Activity feed and notifications
- Member lists and project data
- Kanban boards data

## 8. UI/UX Design

### **Responsive Design**
Works seamlessly across desktop, tablet, and mobile.

**Implementation:**
- Tailwind CSS responsive utilities
- Flexible grid layouts
- Mobile-friendly navigation
- Touch-optimized interactions

### **Accessible Components**
Built with accessibility in mind.

**Features:**
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatibility

**Technologies:**
- **Radix UI** - Accessible primitives
- **shadcn/ui** - Styled accessible components

### **Modern UI**
Clean, professional interface with smooth animations.

**Features:**
- Smooth transitions and animations
- Consistent color scheme
- Icon-based actions
- Hover states and feedback
- Loading skeletons

**Technologies:**
- Tailwind CSS for styling
- Tailwind Animate for animations
- Lucide React for icons
- Class Variance Authority for component variants
