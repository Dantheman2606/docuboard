// features/auth/components/ProtectedAction.tsx
import React from 'react';
import { usePermissions, Permission } from '../hooks/usePermissions';

interface ProtectedActionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDisabled?: boolean;
  disabledMessage?: string;
}

export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  permission,
  children,
  fallback = null,
  showDisabled = false,
  disabledMessage,
}) => {
  const { can } = usePermissions();

  const hasPermission = can(permission);

  if (!hasPermission && !showDisabled) {
    return <>{fallback}</>;
  }

  if (!hasPermission && showDisabled) {
    return (
      <div 
        className="relative cursor-not-allowed opacity-50" 
        title={disabledMessage || `You need ${permission} permission for this action`}
      >
        <div className="pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
