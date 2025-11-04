// /lib/api.ts
// Commented out mock data - now using backend API
// import { projects } from "./mockData";
import { useDocumentStore } from "@/stores/documentStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to detect if error is a connection failure
const isConnectionError = (error: any): boolean => {
  // Check for common connection error patterns
  return (
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('NetworkError') ||
    error?.message?.includes('Network request failed') ||
    error?.code === 'ECONNREFUSED' ||
    error?.name === 'TypeError' && error?.message?.includes('fetch')
  );
};

// Wrapper for fetch that detects offline status
const fetchWithOfflineDetection = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    // If fetch succeeds, we're definitely online
    // Use try-catch to avoid errors during store initialization
    try {
      const store = useDocumentStore.getState();
      if (store && !store.isOnline) {
        console.log('🌐 Connection detected - setting online');
        store.setIsOnline(true);
      }
    } catch (storeError) {
      // Store not ready yet, ignore
    }
    
    return response;
  } catch (error: any) {
    // Check if this is a connection error
    if (isConnectionError(error)) {
      console.log('📴 Connection error detected - setting offline');
      // Use try-catch to avoid errors during store initialization
      try {
        const store = useDocumentStore.getState();
        if (store) {
          store.setIsOnline(false);
        }
      } catch (storeError) {
        // Store not ready yet, ignore
      }
    }
    throw error;
  }
};

export interface Project {
  id: string;
  name: string;
  description: string;
  color?: string;
  docs: {
    id: string;
    title: string;
  }[];
}

export interface DocumentVersion {
  versionNumber: number;
  content: string;
  timestamp: string;
  author: string;
  description: string;
  _id?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  versions?: DocumentVersion[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'comment' | 'assignment' | 'system';
  message: string;
  read: boolean;
  metadata: {
    projectId?: string;
    documentId?: string;
    boardId?: string;
    cardId?: string;
    mentionedBy?: {
      id: string;
      name: string;
      username: string;
    };
    context?: string;
  };
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface KanbanBoard {
  id: string;
  name: string;
  projectId: string;
  columns: Record<string, {
    id: string;
    title: string;
    cardIds: string[];
  }>;
  cards: Record<string, {
    id: string;
    title: string;
    description?: string;
    assignee?: string;
    labels?: string[];
    dueDate?: string;
    docId?: string;
  }>;
  columnOrder: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  projectId: string;
  boardId?: string;
  cardId?: string;
  type: 'card_created' | 'card_updated' | 'card_moved' | 'card_deleted' | 'board_created' | 'board_updated' | 'board_deleted' | 'document_created' | 'document_updated' | 'document_deleted';
  action: string;
  user: {
    id?: string;
    name: string;
    username?: string;
  };
  metadata?: Record<string, any>;
  timestamp: string;
}

export const api = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) throw new Error('Project not found');
    return response.json();
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  // Documents
  getDocuments: async (projectId: string): Promise<Document[]> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/documents/project/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  getDocument: async (id: string): Promise<Document> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/documents/${id}`);
    if (!response.ok) throw new Error('Document not found');
    return response.json();
  },

  createDocument: async (data: Partial<Document>): Promise<Document> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  },

  updateDocument: async (id: string, data: Partial<Document>): Promise<Document> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  },

  deleteDocument: async (id: string): Promise<void> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
  },

  // Kanban Boards
  getKanbanBoards: async (projectId: string): Promise<KanbanBoard[]> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/kanban/project/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch kanban boards');
    return response.json();
  },

  getKanbanBoard: async (boardId: string): Promise<KanbanBoard> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/kanban/${boardId}`);
    if (!response.ok) throw new Error('Failed to fetch kanban board');
    return response.json();
  },

  createKanbanBoard: async (data: Partial<KanbanBoard>): Promise<KanbanBoard> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/kanban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create kanban board');
    }
    return response.json();
  },

  updateKanbanBoard: async (boardId: string, data: Partial<KanbanBoard>): Promise<KanbanBoard> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/kanban/${boardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update kanban board');
    return response.json();
  },

  deleteKanbanBoard: async (boardId: string): Promise<void> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/kanban/${boardId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete kanban board');
  },

  // Authentication
  login: async (username: string, password: string): Promise<{
    id: string;
    username: string;
    name: string;
    role: string;
  }> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to login');
    }
    return response.json();
  },

  signup: async (username: string, password: string, name: string, role?: string): Promise<{
    id: string;
    username: string;
    name: string;
    role: string;
  }> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name, role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to signup');
    }
    return response.json();
  },

  // Version Management
  createVersion: async (documentId: string, data: {
    content: string;
    author: string;
    description?: string;
  }): Promise<DocumentVersion> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/documents/${documentId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create version');
    return response.json();
  },

  getVersions: async (documentId: string): Promise<DocumentVersion[]> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/documents/${documentId}/versions`);
    if (!response.ok) throw new Error('Failed to fetch versions');
    return response.json();
  },

  getVersion: async (documentId: string, versionNumber: number): Promise<DocumentVersion> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/documents/${documentId}/versions/${versionNumber}`);
    if (!response.ok) throw new Error('Failed to fetch version');
    return response.json();
  },

  restoreVersion: async (documentId: string, versionNumber: number): Promise<Document> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/documents/${documentId}/versions/${versionNumber}/restore`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to restore version');
    return response.json();
  },

  // Activity Feed
  getActivities: async (projectId: string, options?: { limit?: number; offset?: number; boardId?: string }): Promise<Activity[]> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.boardId) params.append('boardId', options.boardId);
    
    const url = `${API_BASE_URL}/activity/project/${projectId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetchWithOfflineDetection(url);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  createActivity: async (data: Partial<Activity>): Promise<Activity> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create activity');
    return response.json();
  },

  // Notifications
  getNotifications: async (userId: string, options?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    
    const url = `${API_BASE_URL}/notifications/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetchWithOfflineDetection(url);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/notifications/user/${userId}/unread-count`);
    if (!response.ok) throw new Error('Failed to fetch unread count');
    const data = await response.json();
    return data.count;
  },

  markNotificationAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  markAllNotificationsAsRead: async (userId: string): Promise<void> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
  },

  createMentionNotifications: async (data: {
    mentionedUsernames: string[];
    mentionedBy: { id: string; name: string; username: string };
    context?: string;
    projectId?: string;
    documentId?: string;
    boardId?: string;
    cardId?: string;
  }): Promise<{ notificationsCreated: number }> => {
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/notifications/create-mentions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create mention notifications');
    return response.json();
  },

  searchUsers: async (query?: string): Promise<Array<{ _id: string; username: string; name: string }>> => {
    const params = query ? `?query=${encodeURIComponent(query)}` : '';
    const response = await fetchWithOfflineDetection(`${API_BASE_URL}/notifications/users/search${params}`);
    if (!response.ok) throw new Error('Failed to search users');
    return response.json();
  },
};
