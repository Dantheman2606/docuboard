// features/auth/components/RoleSelector.tsx
import React from 'react';
import { Role } from '../types';
import { getRoleColor, getRoleIcon, getRoleLabel, getRoleDescription } from '../utils/permissions';

interface RoleSelectorProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
  availableRoles?: Role[];
  disabled?: boolean;
  className?: string;
}

const ALL_ROLES: Role[] = ['owner', 'admin', 'editor', 'viewer'];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
  availableRoles = ALL_ROLES,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">Select Role</label>
      <div className="grid grid-cols-2 gap-2">
        {availableRoles.map((role) => {
          const RoleIcon = getRoleIcon(role);
          return (
            <button
              key={role}
              type="button"
              onClick={() => onRoleChange(role)}
              disabled={disabled}
              className={`
                flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all
                ${selectedRole === role ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <RoleIcon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{getRoleLabel(role)}</div>
                <div className="text-xs text-gray-500 truncate">
                  {getRoleDescription(role)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
