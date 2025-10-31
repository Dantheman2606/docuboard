// /lib/api.ts
// Commented out mock data - now using backend API
// import { projects } from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Project {
  id: string;
  name: string;
  description: string;
  docs: {
    id: string;
    title: string;
  }[];
}

interface Document {
  id: string;
  title: string;
  content: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface KanbanBoard {
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
}

export const api = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) throw new Error('Project not found');
    return response.json();
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  // Documents
  getDocuments: async (projectId: string): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/documents/project/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  getDocument: async (id: string): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`);
    if (!response.ok) throw new Error('Document not found');
    return response.json();
  },

  createDocument: async (data: Partial<Document>): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  },

  updateDocument: async (id: string, data: Partial<Document>): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  },

  deleteDocument: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
  },

  // Kanban
  getKanbanBoard: async (projectId: string): Promise<KanbanBoard> => {
    const response = await fetch(`${API_BASE_URL}/kanban/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch kanban board');
    return response.json();
  },

  updateKanbanBoard: async (projectId: string, data: KanbanBoard): Promise<KanbanBoard> => {
    const response = await fetch(`${API_BASE_URL}/kanban/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update kanban board');
    return response.json();
  },
};
