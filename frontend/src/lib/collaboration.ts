// /lib/collaboration.ts
/**
 * Utilities for real-time collaboration features
 */

export interface CollaboratorInfo {
  userId: string;
  userName: string;
  color: string;
  connectedAt?: Date;
}

// Predefined colors for collaborators
const COLLABORATOR_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
  '#E74C3C', // Crimson
  '#3498DB', // Peter River
  '#9B59B6', // Amethyst
  '#1ABC9C', // Turquoise
  '#F39C12', // Orange
];

/**
 * Generate a consistent color for a user based on their userId
 * @param userId - User identifier
 * @returns Hex color string
 */
export function getUserColor(userId: string): string {
  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLLABORATOR_COLORS[Math.abs(hash) % COLLABORATOR_COLORS.length];
}

/**
 * Get initials from a user name
 * @param name - User's full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format relative time for presence
 * @param date - Date to format
 * @returns Relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 10) return `${seconds}s ago`;
  return 'just now';
}

/**
 * Get WebSocket URL from environment or default
 * @returns WebSocket URL
 */
export function getWebSocketUrl(): string {
  return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
}

/**
 * Check if two collaborator arrays are equal
 * @param a - First array
 * @param b - Second array
 * @returns true if arrays contain same collaborators
 */
export function areCollaboratorsEqual(
  a: CollaboratorInfo[],
  b: CollaboratorInfo[]
): boolean {
  if (a.length !== b.length) return false;
  
  const aIds = new Set(a.map(c => c.userId));
  const bIds = new Set(b.map(c => c.userId));
  
  if (aIds.size !== bIds.size) return false;
  
  for (const id of aIds) {
    if (!bIds.has(id)) return false;
  }
  
  return true;
}
