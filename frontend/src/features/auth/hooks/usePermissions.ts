// features/auth/hooks/usePermissions.ts
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useQueryClient } from '@tanstack/react-query';
import { Role } from '../types';

export type Permission =
  | 'view'
  | 'edit'
  | 'create'
  | 'delete'
  | 'manage_members'
  | 'rollback_versions';

// Define permissions for each role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['view', 'edit', 'create', 'delete', 'manage_members', 'rollback_versions'],
  admin: ['view', 'edit', 'create', 'delete', 'rollback_versions'],
  editor: ['view', 'edit', 'create'],
  viewer: ['view'],
};

export const usePermissions = () => {
  const { user } = useAuthStore();
  const { currentProjectId } = useUIStore();
  const queryClient = useQueryClient();

  /**
   * Derive the current user's role for the active project by reading
   * directly from the React Query cache — avoids the stale global store bug
   * where switching projects would show the previous project's role.
   */
  const getCurrentRole = (): Role | null => {
    if (!currentProjectId || !user) return null;

    // Read the cached project data for the current project
    const cached = queryClient.getQueryData<{ members: Array<{ userId: string; role: Role }> }>(
      ['project', currentProjectId]
    );

    if (!cached?.members) return null;

    // Find this user in the project members list
    const member = cached.members.find((m) => m.userId === user.id);
    return member?.role ?? null;
  };

  const currentRole = getCurrentRole();

  const can = (permission: Permission): boolean => {
    if (!currentRole) return false;
    return ROLE_PERMISSIONS[currentRole]?.includes(permission) ?? false;
  };

  const canAny = (...permissions: Permission[]): boolean => {
    return permissions.some((permission) => can(permission));
  };

  const canAll = (...permissions: Permission[]): boolean => {
    return permissions.every((permission) => can(permission));
  };

  const hasRole = (role: Role): boolean => {
    return currentRole === role;
  };

  const hasAnyRole = (...roles: Role[]): boolean => {
    if (!currentRole) return false;
    return roles.includes(currentRole);
  };

  // Check if current role has higher or equal privileges than target role
  const canManageRole = (targetRole: Role): boolean => {
    if (!currentRole) return false;

    const roleHierarchy: Record<Role, number> = {
      owner: 4,
      admin: 3,
      editor: 2,
      viewer: 1,
    };

    return roleHierarchy[currentRole] > roleHierarchy[targetRole];
  };

  return {
    can,
    canAny,
    canAll,
    hasRole,
    hasAnyRole,
    canManageRole,
    currentRole,
  };
};
