# Frontend Architecture

## Overview

DocuBoard's frontend is built as a modern Next.js application with TypeScript, following a feature-based architecture pattern. The application emphasizes real-time collaboration, state management, and component reusability.

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│                     (_app.tsx Entry)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌─────────▼─────────┐
│   Providers    │          │   Layout/Pages    │
│                │          │                   │
│  • Auth        │          │  • Dashboard      │
│  • React Query │          │  • Projects       │
│  • Toast       │          │  • Login          │
└───────┬────────┘          └─────────┬─────────┘
        │                             │
        │         ┌───────────────────┴────────────┐
        │         │                                │
        │   ┌─────▼─────────┐              ┌───────▼──────┐
        │   │  Main Content │              │    Sidebar   │
        │   └─────┬─────────┘              └───────┬──────┘
        │         │                                │
        └─────────┼────────────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼─────┐        ┌────────▼────────┐
│  Features │        │  Shared UI      │
│           │        │  Components     │
│ • Editor  │        │  (shadcn/ui)    │
│ • Kanban  │        │                 │
│ • Auth    │        │  • Button       │
│ • Activity│        │  • Dialog       │
└─────┬─────┘        │  • Input        │
      │              │  • Card         │
      │              │  • Select       │
      │              └─────────────────┘
      │
┌─────▼──────────────────────────────────┐
│         State Management               │
│                                        │
│  Zustand Stores:                       │
│  • documentStore   (Documents state)   │
│  • kanbanStore     (Kanban boards)     │
│  • presenceStore   (User presence)     │
│  • uiStore         (UI state)          │
│                                        │
│  React Query:                          │
│  • Server state caching                │
│  • Automatic refetching                │
│  • Optimistic updates                  │
└────────────────────────────────────────┘
```

## Directory Structure

### **Features-Based Organization**
Each major feature is self-contained with its own components, hooks, and utilities:

- **`/features/editor`** - Rich text editing and collaboration
- **`/features/kanban`** - Kanban board management
- **`/features/auth`** - Authentication and RBAC
- **`/features/activity`** - Activity feed and notifications

### **Shared Resources**
- **`/components`** - Layout components and shared UI
- **`/hooks`** - Custom React hooks for data fetching
- **`/stores`** - Zustand state management stores
- **`/lib`** - Utility functions and API client
- **`/pages`** - Next.js page routes

## Technology Stack

### **Core Framework**
- **Next.js 16** - React framework with SSR/SSG capabilities
- **TypeScript** - Type-safe development
- **React 19** - UI library with latest features

### **UI & Styling**
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Radix-based accessible components
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

### **State Management**
- **Zustand** - Lightweight state management (documents, kanban, UI state)
- **React Query** - Server state management with automatic caching and refetching
- **Query Persist Client** - Persistent query cache across sessions

### **Real-Time Collaboration**
- **WebSocket (ws)** - Real-time bidirectional communication
- **Custom collaboration protocol** - JSON-based messages for content sync and cursors

### **Rich Text Editor**
- **TipTap** - Extensible rich text editor framework
- **TipTap Extensions** - Collaboration, cursors, formatting, links, mentions
- **Tippy.js** - Tooltip and popover positioning

### **Drag & Drop**
- **@hello-pangea/dnd** - Beautiful drag-and-drop for Kanban boards (React-beautiful-dnd fork)

### **Utilities**
- **clsx & tailwind-merge** - Conditional class name handling
- **diff-match-patch** - Text diffing for version history

## Design Patterns

### **Component Composition**
Components are designed to be composable and reusable, following the single responsibility principle.

### **Custom Hooks**
Business logic is extracted into custom hooks for better testability and reusability.

### **Feature Modules**
Features are organized as modules with clear exports, making the codebase more maintainable.

### **Type Safety**
TypeScript is used throughout for compile-time type checking and better developer experience.

### **Separation of Concerns**
- **Components** handle presentation
- **Hooks** manage data fetching and side effects  
- **Stores** manage global state (Zustand with persist middleware)
- **API layer** handles server communication (axios-based)
- **WebSocket** handles real-time collaboration
