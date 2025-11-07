# 📋 DocuBoard – Real-Time Collaborative Project Management Platform

![Stack](https://img.shields.io/badge/stack-MERN%2BNext.js-blue) ![Real-Time](https://img.shields.io/badge/Real--Time-Yjs%2BWebSocket-green) 

DocuBoard is a modern, **real-time collaborative workspace** that combines the best of **Confluence-style documentation** with **Jira-style Kanban boards**. Built for teams who need seamless collaboration, rich-text editing, and agile project management — all in one unified platform.

---

## 🚀 What Makes DocuBoard Different?

• ✅ **Real-Time Collaboration**: Multiple users can edit documents simultaneously using Yjs and WebSocket technology  
• 📝 **Rich Text Editor**: Powered by TipTap with support for mentions, formatting, links, and collaborative cursors  
• 🎯 **Kanban Boards**: Drag-and-drop task management with real-time updates across all team members  
• 🔐 **Role-Based Access Control (RBAC)**: Four-tier permission system (Owner, Admin, Editor, Viewer)  
• 📊 **Activity Tracking**: Real-time notifications and activity feed for all project updates  
• 🎨 **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui for a beautiful, responsive interface  
• 🔄 **Version Control**: Document rollback capabilities for tracking changes and reverting when needed  
• 👥 **Team Management**: Add members, assign roles, and manage permissions per project  

---
## ✨ Key Features

### 📝 Collaborative Documentation
- **Rich Text Editing**: Format text, add links, highlights, and more
- **Real-Time Sync**: See changes as they happen with collaborative cursors
- **Mentions System**: Tag team members in documents
- **Version History**: Rollback to previous versions when needed

### 🎯 Kanban Boards
- **Drag & Drop**: Intuitive card management
- **Real-Time Updates**: Changes sync across all users instantly
- **Customizable Columns**: Create custom workflow stages
- **Card Details**: Add descriptions, assignments, and metadata

### 🔔 Activity & Notifications
- **Live Activity Feed**: Track all project changes in real-time
- **Notification System**: Get notified about important updates
- **User Presence**: See who's online and active in your projects

### 👥 Team Collaboration
- **Member Management**: Add/remove team members
- **Role Assignment**: Set appropriate permission levels
- **Multi-Project Support**: Work across multiple projects seamlessly

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|-------------|
| [Next.js 16](https://nextjs.org) | React framework with SSR/SSG |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Modern React components |
| [TipTap](https://tiptap.dev) | Rich text editor |
| [Zustand](https://github.com/pmndrs/zustand) | State management |
| [React Query](https://tanstack.com/query/latest) | Server state & caching |
| [Yjs](https://docs.yjs.dev/) | Real-time collaboration |
| [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) | Drag & drop for Kanban |
| [Lucide React](https://lucide.dev) | Icon library |

### Backend
| Technology | Purpose |
|-----------|-------------|
| [Node.js](https://nodejs.org) | Runtime environment |
| [Express.js](https://expressjs.com) | Web framework |
| [MongoDB](https://www.mongodb.com) | NoSQL database |
| [Mongoose](https://mongoosejs.com) | MongoDB ODM |
| [WebSocket (ws)](https://github.com/websockets/ws) | Real-time communication |
| [Yjs](https://docs.yjs.dev/) | CRDT for collaboration |

---

## 💻 How It Works

1. **User Authentication** → Create account and log in
2. **Create Project** → Set up a new workspace with automatic Owner role assignment
3. **Invite Team Members** → Add collaborators with specific roles (Admin, Editor, or Viewer)
4. **Real-Time Collaboration** → Edit documents together with live cursors and updates
5. **Kanban Management** → Create boards, add cards, and track progress with drag-and-drop
6. **Activity Monitoring** → View real-time notifications and activity feed for all changes

---

## 🎭 Role-Based Access Control

DocuBoard implements a comprehensive four-tier RBAC system:

| Role | Icon | Permissions |
|------|------|-------------|
| **Owner** | 👑 | Full control: view, edit, create, delete, manage members, rollback versions |
| **Admin** | ⚙️ | Manage content: view, edit, create, delete, rollback versions |
| **Editor** | ✏️ | Content creation: view, edit, create |
| **Viewer** | 👁️ | Read-only: view |

---



## 📈 Future Scope

• 🔍 **Advanced Search**: Full-text search across all documents and boards  
• 📎 **File Attachments**: Support for images, PDFs, and other file uploads  
• 🎨 **Custom Themes**: Dark mode and customizable color schemes  
• 📱 **Mobile App**: Native iOS and Android applications  
• 🔗 **Third-Party Integrations**: Connect with Slack, GitHub, and other tools  
• 📊 **Analytics Dashboard**: Project insights, productivity metrics, and reports  
• 🤖 **AI Assistance**: Smart suggestions and content generation  
• 🌐 **Internationalization**: Multi-language support  

---

## 🔧 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Dantheman2606/docuboard.git
cd docuboard

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. **Backend Environment Variables**  
   Create a `.env` file in the `backend` folder:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

2. **Frontend Environment Variables**  
   Create a `.env.local` file in the `frontend` folder:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=ws://localhost:1234
   ```

### Running the Application

```bash
# Terminal 1 - Start MongoDB (if running locally)
mongod

# Terminal 2 - Start backend server
cd backend
npm run dev

# Terminal 3 - Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access DocuBoard!

---




