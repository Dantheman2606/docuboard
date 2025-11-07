# Known Limitations & Future Improvements

## Current Limitations

### **1. Scalability Constraints**

**WebSocket Connection Limits**
- Current single-server WebSocket implementation may struggle with hundreds of concurrent users
- No load balancing for collaboration server
- Memory usage grows with number of active documents

**Database Performance**
- No indexing optimization for large datasets
- Full document content stored in versions (no delta compression)
- Activity feed queries not paginated on backend

### **2. Collaboration Edge Cases**

**Network Interruptions**
- Extended offline periods may cause merge complexity
- Large offline edits can take time to sync when reconnected
- No visual indicator for sync status during poor connectivity

**Concurrent Editing Limits**
- WebSocket-based sync doesn't have CRDT guarantees
- Simultaneous edits to same position could cause conflicts
- Last-write-wins approach may lose some edits in extreme race conditions
- Works well for typical collaboration scenarios (2-5 users)

### **3. Feature Gaps**

**Missing Editor Features**
- No image/file upload in documents
- No table support in editor
- Limited code syntax highlighting options
- No export to PDF/Word functionality

**Kanban Limitations**
- No calendar view
- No card attachments or comments
- No subtasks or checklists
- No time tracking features
- No swim lanes or advanced board layouts

**User Experience**
- No dark mode support
- Limited customization options (themes, layouts)
- No keyboard shortcuts reference guide
- No onboarding tutorial for new users

### **4. Security & Privacy**

**Authentication**
- No JWT or secure token-based authentication (uses simple localStorage)
- Passwords stored in plain text (demo purposes only - NOT production ready)
- No two-factor authentication (2FA)
- No password strength enforcement
- No session timeout mechanism
- Sessions persist indefinitely in localStorage

**Data Protection**
- No end-to-end encryption for documents
- No audit trail for security events
- No IP allowlisting or geofencing

### **5. Mobile Experience**

**Responsive Design Limitations**
- Editor toolbar not fully optimized for mobile
- Drag-and-drop on touch devices can be finicky
- No native mobile apps
- Limited offline capabilities

### **6. Performance**

**Bundle Size**
- Large initial JavaScript bundle due to TipTap and dependencies (~500KB compressed)
- No lazy loading of some editor extensions
- Heavy dependencies increase initial load time
- Next.js automatic code splitting helps but could be optimized further

**Caching**
- Browser cache can grow large over time
- No automatic cache cleanup mechanism

## Planned Future Improvements

### **Short-Term Enhancements**

**1. User Experience**
- Implement dark mode with theme toggle
- Add comprehensive keyboard shortcuts
- Create onboarding flow for new users
- Add loading skeletons for better perceived performance
- Implement toast notifications for all user actions

**2. Editor Enhancements**
- Add image upload with drag-and-drop support
- Implement table creation and editing
- Add export functionality (PDF, Markdown, HTML)
- Enhanced code blocks with syntax highlighting for more languages

**3. Kanban Features**
- Add due dates and calendar integration
- Implement card labels/tags system
- Add card attachments (files, images)
- Create activity/comment section per card
- Add card templates for quick creation

**4. Performance Optimizations**
- Implement code splitting for editor components
- Lazy load TipTap extensions on demand
- Add virtual scrolling for large lists
- Optimize bundle size with tree shaking
- Implement service worker for offline support

### **Mid-Term Goals**

**1. Advanced Collaboration**
- Upgrade to CRDT-based collaboration (Yjs or Automerge) for stronger consistency
- Screen sharing for presentations
- Commenting system on documents (inline comments)
- Suggested edits and approval workflow
- Document templates library
- Better offline conflict resolution

**2. Analytics & Insights**
- User activity analytics dashboard
- Document edit statistics
- Kanban board velocity metrics
- Time tracking per task
- Export reports (CSV, PDF)

**3. Integration Capabilities**
- Slack/Discord notifications
- Google Drive/Dropbox integration
- Calendar integration (Google, Outlook)
- Git integration for developer workflows
- API for third-party integrations

**4. Security Enhancements**
- Implement JWT or session-based authentication with proper security
- Hash passwords using bcrypt or similar
- Two-factor authentication (2FA)
- OAuth integration (Google, GitHub)
- Session timeout and refresh mechanisms
- Granular permission system expansion
- Audit logs for compliance
- End-to-end encryption option
- HTTPS enforcement

**5. Mobile Applications**
- React Native mobile app for iOS/Android
- Offline-first architecture
- Push notifications
- Native mobile UX optimizations




