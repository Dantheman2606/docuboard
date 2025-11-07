// features/auth/hooks/usePermissions.ts
import { useAuthStore } from '../store/authStore';
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
  const { currentProjectRole } = useAuthStore();

  const can = (permission: Permission): boolean => {
    if (!currentProjectRole) return false;
    return ROLE_PERMISSIONS[currentProjectRole]?.includes(permission) ?? false;
  };

  const canAny = (...permissions: Permission[]): boolean => {
    return permissions.some(permission => can(permission));
  };

  const canAll = (...permissions: Permission[]): boolean => {
    return permissions.every(permission => can(permission));
  };

  const hasRole = (role: Role): boolean => {
    return currentProjectRole === role;
  };

  const hasAnyRole = (...roles: Role[]): boolean => {
    if (!currentProjectRole) return false;
    return roles.includes(currentProjectRole);
  };

  // Check if current role has higher or equal privileges than target role
  const canManageRole = (targetRole: Role): boolean => {
    if (!currentProjectRole) return false;
    
    const roleHierarchy: Record<Role, number> = {
      owner: 4,
      admin: 3,
      editor: 2,
      viewer: 1,
    };

    return roleHierarchy[currentProjectRole] > roleHierarchy[targetRole];
  };

  return {
    can,
    canAny,
    canAll,
    hasRole,
    hasAnyRole,
    canManageRole,
    currentRole: currentProjectRole,
  };
};
