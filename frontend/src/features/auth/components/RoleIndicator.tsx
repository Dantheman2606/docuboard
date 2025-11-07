// features/auth/components/RoleIndicator.tsx
import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { getRoleColor, getRoleIcon, getRoleLabel, getRoleDescription } from '../utils/permissions';

interface RoleIndicatorProps {
  className?: string;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleIndicator: React.FC<RoleIndicatorProps> = ({
  className = '',
  showDescription = false,
  size = 'md',
}) => {
  const { currentRole } = usePermissions();

  if (!currentRole) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const RoleIcon = getRoleIcon(currentRole);

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${getRoleColor(
          currentRole
        )} ${sizeClasses[size]}`}
        title={showDescription ? undefined : getRoleDescription(currentRole)}
      >
        <RoleIcon className={iconSizes[size]} />
        <span>{getRoleLabel(currentRole)}</span>
      </span>
      {showDescription && (
        <span className="text-sm text-gray-600">
          {getRoleDescription(currentRole)}
        </span>
      )}
    </div>
  );
};
