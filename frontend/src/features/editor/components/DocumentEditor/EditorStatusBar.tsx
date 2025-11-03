// /features/editor/components/DocumentEditor/EditorStatusBar.tsx
"use client";

import { WifiOff, Wifi, Users } from "lucide-react";
import type { CollaboratorInfo } from "@/hooks/useCollaboration";

interface EditorStatusBarProps {
  isOnline: boolean;
  pendingSync?: boolean;
  isCollaborationConnected?: boolean;
  collaborators?: CollaboratorInfo[];
}

export function EditorStatusBar({ 
  isOnline, 
  pendingSync, 
  isCollaborationConnected,
  collaborators = [] 
}: EditorStatusBarProps) {
  // Filter out current user and get unique collaborators
  const otherCollaborators = collaborators.filter((c, index, self) => 
    index === self.findIndex((t) => t.userId === c.userId)
  );

  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 text-sm flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <WifiOff size={16} />
          <span>You're offline. Changes will be saved locally and synced when you're back online.</span>
        </div>
      </div>
    );
  }

  if (isOnline && pendingSync) {
    return (
      <div className="bg-blue-500 text-white px-4 py-2 text-sm flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Wifi size={16} />
          <span>Syncing changes to server...</span>
        </div>
      </div>
    );
  }

  // Don't show collaboration banner - collaborators are shown in the header dropdown
  return null;
}
