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

export interface Document {
  id: string;
  title: string;
  content: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
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
    description: string;
    assignee?: string;
    labels?: string[];
    dueDate?: string;
  }>;
  columnOrder: string[];
  createdAt?: string;
  updatedAt?: string;
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
};
