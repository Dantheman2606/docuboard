// /lib/api.ts
import { useDocumentStore } from "@/stores/documentStore";
import { useAuthStore } from "@/features/auth/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const isConnectionError = (error: any): boolean =>
  error?.message?.includes('Failed to fetch') ||
  error?.message?.includes('NetworkError') ||
  error?.message?.includes('Network request failed') ||
  error?.code === 'ECONNREFUSED' ||
  (error?.name === 'TypeError' && error?.message?.includes('fetch'));

/** Get the JWT token from Zustand store (works outside React components too). */
const getToken = (): string | null => {
  try {
    return useAuthStore.getState().token;
  } catch {
    return null;
  }
};

/** Build default headers, always injecting Authorization if a token exists. */
const buildHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/** Fetch with offline detection and automatic auth header injection. */
const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = buildHeaders(options.headers as Record<string, string> | undefined);
  try {
    const response = await fetch(url, { ...options, headers });
    try {
      const store = useDocumentStore.getState();
      if (store && !store.isOnline) store.setIsOnline(true);
    } catch { /* store not ready */ }
    return response;
  } catch (error: any) {
    if (isConnectionError(error)) {
      try { useDocumentStore.getState()?.setIsOnline(false); } catch { /* ignore */ }
    }
    throw error;
  }
};

/**
 * Parse a backend response.
 * New endpoints return { success, data } — unwrap data.
 * Legacy endpoints (if any) return the payload directly.
 */
const parseResponse = async <T>(response: Response): Promise<T> => {
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
  }
  // Unwrap { success: true, data: ... } envelope
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
};

// ─────────────────────────────────────────────────────────────────────────────
// Types (unchanged — kept compatible with the existing frontend)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectMember {
  userId: string;
  name: string;
  username: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  addedAt: string;
}

export interface ProjectJoinRequest {
  userId: string;
  name?: string;
  username?: string;
  requestedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color?: string;
  projectCode?: string;
  docs: { id: string; title: string }[];
  members?: ProjectMember[];
  joinRequests?: ProjectJoinRequest[];
  userRole?: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface DocumentVersion {
  versionNumber: number;
  content: string;
  timestamp: string;
  author: string;
  authorName?: string;
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
    mentionedBy?: { id: string; name: string; username: string };
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
  columns: Record<string, { id: string; title: string; cardIds: string[] }>;
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
  type:
    | 'card_created' | 'card_updated' | 'card_moved' | 'card_deleted'
    | 'board_created' | 'board_updated' | 'board_deleted'
    | 'document_created' | 'document_updated' | 'document_deleted';
  action: string;
  user: { id?: string; name: string; username?: string };
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  user: { id: string; username: string; email: string; name: string; role: string };
}

export interface UserProjectSummary {
  id: string;
  name: string;
  color?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface UserSettingsResponse {
  user: { id: string; username: string; email: string; name: string; role?: string };
  projectCount: number;
  projects: UserProjectSummary[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API methods
// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  // ── Auth ─────────────────────────────────────────────────────────────────
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return parseResponse<AuthResponse>(res);
  },

  signup: async (username: string, email: string, password: string, name: string, role?: string): Promise<AuthResponse> => {
    const res = await apiFetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ username, email, password, name, role }),
    });
    return parseResponse<AuthResponse>(res);
  },

  getMe: async (): Promise<AuthResponse['user']> => {
    const res = await apiFetch(`${API_BASE_URL}/auth/me`);
    return parseResponse<AuthResponse['user']>(res);
  },

  // ── Projects ─────────────────────────────────────────────────────────────
  getProjects: async (_userId?: string): Promise<Project[]> => {
    const res = await apiFetch(`${API_BASE_URL}/projects`);
    return parseResponse<Project[]>(res);
  },

  getProject: async (id: string, _userId?: string): Promise<Project> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${id}`);
    return parseResponse<Project>(res);
  },

  createProject: async (data: Partial<Project> & { userId?: string }): Promise<Project> => {
    const { userId: _unused, ...body } = data as any;
    const res = await apiFetch(`${API_BASE_URL}/projects`, { method: 'POST', body: JSON.stringify(body) });
    return parseResponse<Project>(res);
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return parseResponse<Project>(res);
  },

  deleteProject: async (id: string, confirmation?: { name: string; password: string }): Promise<void> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(confirmation || {}),
    });
    await parseResponse<any>(res);
  },

  // ── Project Members ───────────────────────────────────────────────────────
  addProjectMember: async (projectId: string, userId: string, role: string): Promise<{ members: ProjectMember[] }> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
    return parseResponse<{ members: ProjectMember[] }>(res);
  },

  updateProjectMember: async (projectId: string, userId: string, role: string): Promise<{ members: ProjectMember[] }> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return parseResponse<{ members: ProjectMember[] }>(res);
  },

  removeProjectMember: async (projectId: string, userId: string): Promise<{ members: ProjectMember[] }> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
    return parseResponse<{ members: ProjectMember[] }>(res);
  },

  leaveProject: async (projectId: string): Promise<{ message: string }> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${projectId}/leave`, { method: 'POST' });
    return parseResponse<{ message: string }>(res);
  },

  // ── Project Join Requests ─────────────────────────────────────────────────
  requestProjectJoin: async (code: string): Promise<Project> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/join-request`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return parseResponse<Project>(res);
  },

  getProjectJoinRequests: async (projectId: string): Promise<ProjectJoinRequest[]> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${projectId}/requests`);
    const data = await parseResponse<{ requests: ProjectJoinRequest[] }>(res);
    return data.requests;
  },

  approveProjectJoinRequest: async (projectId: string, userId: string): Promise<Project> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${projectId}/requests/${userId}/approve`, {
      method: 'POST',
    });
    return parseResponse<Project>(res);
  },

  rejectProjectJoinRequest: async (projectId: string, userId: string): Promise<Project> => {
    const res = await apiFetch(`${API_BASE_URL}/projects/${projectId}/requests/${userId}`, {
      method: 'DELETE',
    });
    return parseResponse<Project>(res);
  },

  // ── Documents ─────────────────────────────────────────────────────────────
  getDocuments: async (projectId: string): Promise<Document[]> => {
    const res = await apiFetch(`${API_BASE_URL}/documents/project/${projectId}`);
    return parseResponse<Document[]>(res);
  },

  getDocument: async (id: string): Promise<Document> => {
    const res = await apiFetch(`${API_BASE_URL}/documents/${id}`);
    return parseResponse<Document>(res);
  },

  createDocument: async (data: Partial<Document>): Promise<Document> => {
    const res = await apiFetch(`${API_BASE_URL}/documents`, { method: 'POST', body: JSON.stringify(data) });
    return parseResponse<Document>(res);
  },

  updateDocument: async (id: string, data: Partial<Document>): Promise<Document> => {
    const res = await apiFetch(`${API_BASE_URL}/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return parseResponse<Document>(res);
  },

  deleteDocument: async (id: string): Promise<void> => {
    const res = await apiFetch(`${API_BASE_URL}/documents/${id}`, { method: 'DELETE' });
    await parseResponse<any>(res);
  },

  // ── Versions ──────────────────────────────────────────────────────────────
  createVersion: async (documentId: string, data: { content: string; author: string; description?: string }): Promise<DocumentVersion> => {
    const res = await apiFetch(`${API_BASE_URL}/documents/${documentId}/versions`, { method: 'POST', body: JSON.stringify(data) });
    return parseResponse<DocumentVersion>(res);
  },

  getVersions: async (documentId: string): Promise<DocumentVersion[]> => {
    const res = await apiFetch(`${API_BASE_URL}/documents/${documentId}/versions`);
    return parseResponse<DocumentVersion[]>(res);
  },

  getVersion: async (documentId: string, versionNumber: number): Promise<DocumentVersion> => {
    const res = await apiFetch(`${API_BASE_URL}/documents/${documentId}/versions/${versionNumber}`);
    return parseResponse<DocumentVersion>(res);
  },

  restoreVersion: async (documentId: string, versionNumber: number): Promise<Document> => {
    const res = await apiFetch(`${API_BASE_URL}/documents/${documentId}/versions/${versionNumber}/restore`, { method: 'POST' });
    return parseResponse<Document>(res);
  },

  // ── Kanban ────────────────────────────────────────────────────────────────
  getKanbanBoards: async (projectId: string): Promise<KanbanBoard[]> => {
    const res = await apiFetch(`${API_BASE_URL}/kanban/project/${projectId}`);
    return parseResponse<KanbanBoard[]>(res);
  },

  getKanbanBoard: async (boardId: string): Promise<KanbanBoard> => {
    const res = await apiFetch(`${API_BASE_URL}/kanban/${boardId}`);
    return parseResponse<KanbanBoard>(res);
  },

  createKanbanBoard: async (data: Partial<KanbanBoard>): Promise<KanbanBoard> => {
    const res = await apiFetch(`${API_BASE_URL}/kanban`, { method: 'POST', body: JSON.stringify(data) });
    return parseResponse<KanbanBoard>(res);
  },

  updateKanbanBoard: async (boardId: string, data: Partial<KanbanBoard>): Promise<KanbanBoard> => {
    const res = await apiFetch(`${API_BASE_URL}/kanban/${boardId}`, { method: 'PUT', body: JSON.stringify(data) });
    return parseResponse<KanbanBoard>(res);
  },

  deleteKanbanBoard: async (boardId: string): Promise<void> => {
    const res = await apiFetch(`${API_BASE_URL}/kanban/${boardId}`, { method: 'DELETE' });
    await parseResponse<any>(res);
  },

  createKanbanCard: async (boardId: string, data: {
    title: string;
    description?: string;
    assignee?: string;
    labels?: string[];
    dueDate?: string | null;
    columnId?: string;
    projectId?: string;
  }): Promise<KanbanBoard['cards'][string]> => {
    const res = await apiFetch(`${API_BASE_URL}/kanban/${boardId}/cards`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return parseResponse<KanbanBoard['cards'][string]>(res);
  },


  getActivities: async (projectId: string, options?: { limit?: number; offset?: number; boardId?: string }): Promise<Activity[]> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.boardId) params.append('boardId', options.boardId);
    const res = await apiFetch(`${API_BASE_URL}/activity/project/${projectId}${params.toString() ? `?${params}` : ''}`);
    return parseResponse<Activity[]>(res);
  },

  createActivity: async (data: Partial<Activity>): Promise<Activity> => {
    const res = await apiFetch(`${API_BASE_URL}/activity`, { method: 'POST', body: JSON.stringify(data) });
    return parseResponse<Activity>(res);
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications: async (userId: string, options?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    const res = await apiFetch(`${API_BASE_URL}/notifications/user/${userId}${params.toString() ? `?${params}` : ''}`);
    return parseResponse<Notification[]>(res);
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const res = await apiFetch(`${API_BASE_URL}/notifications/user/${userId}/unread-count`);
    const data = await parseResponse<{ count: number }>(res);
    return data.count;
  },

  markNotificationAsRead: async (notificationId: string): Promise<Notification> => {
    const res = await apiFetch(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: 'PATCH' });
    return parseResponse<Notification>(res);
  },

  markAllNotificationsAsRead: async (userId: string): Promise<void> => {
    const res = await apiFetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, { method: 'PATCH' });
    await parseResponse<any>(res);
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
    const res = await apiFetch(`${API_BASE_URL}/notifications/create-mentions`, { method: 'POST', body: JSON.stringify(data) });
    return parseResponse<{ notificationsCreated: number }>(res);
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  searchUsers: async (query?: string): Promise<Array<{ _id: string; id: string; username: string; name: string }>> => {
    const params = query ? `?query=${encodeURIComponent(query)}` : '';
    const res = await apiFetch(`${API_BASE_URL}/users/search${params}`);
    return parseResponse<Array<{ _id: string; id: string; username: string; name: string }>>(res);
  },

  getUserSettings: async (): Promise<UserSettingsResponse> => {
    const res = await apiFetch(`${API_BASE_URL}/users/me/settings`);
    return parseResponse<UserSettingsResponse>(res);
  },

  updateMe: async (data: { username?: string; name?: string }): Promise<UserSettingsResponse['user']> => {
    const res = await apiFetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return parseResponse<UserSettingsResponse['user']>(res);
  },
};
