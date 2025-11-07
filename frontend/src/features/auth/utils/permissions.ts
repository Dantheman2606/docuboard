// features/auth/utils/permissions.ts
import { Role } from '../types';
import type { Permission } from '../hooks/usePermissions';
import { Crown, Settings, Edit, Eye, LucideIcon } from 'lucide-react';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['view', 'edit', 'create', 'delete', 'manage_members', 'rollback_versions'],
  admin: ['view', 'edit', 'create', 'delete', 'rollback_versions'],
  editor: ['view', 'edit', 'create'],
  viewer: ['view'],
};

export const checkPermission = (role: Role | null, permission: Permission): boolean => {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

export const getRoleColor = (role: Role): string => {
  const colors: Record<Role, string> = {
    owner: 'bg-purple-100 text-purple-800 border-purple-300',
    admin: 'bg-blue-100 text-blue-800 border-blue-300',
    editor: 'bg-green-100 text-green-800 border-green-300',
    viewer: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[role] || colors.viewer;
};

export const getRoleIcon = (role: Role): LucideIcon => {
  const icons: Record<Role, LucideIcon> = {
    owner: Crown,
    admin: Settings,
    editor: Edit,
    viewer: Eye,
  };
  return icons[role] || icons.viewer;
};

export const getRoleLabel = (role: Role): string => {
  const labels: Record<Role, string> = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
  };
  return labels[role] || 'Unknown';
};

export const getRoleDescription = (role: Role): string => {
  const descriptions: Record<Role, string> = {
    owner: 'Full control over the project',
    admin: 'Manage content & rollback versions',
    editor: 'Edit pages and cards',
    viewer: 'Read-only access',
  };
  return descriptions[role] || '';
};

export const roleHierarchy: Record<Role, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export const canManageRole = (currentRole: Role | null, targetRole: Role): boolean => {
  if (!currentRole) return false;
  return roleHierarchy[currentRole] > roleHierarchy[targetRole];
};
