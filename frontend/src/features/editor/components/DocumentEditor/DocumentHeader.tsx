// /features/editor/components/DocumentEditor/DocumentHeader.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Save, Clock, ChevronUp, ChevronDown, Users } from "lucide-react";
import { VersionHistoryDropdown } from "./VersionHistoryDropdown";
import type { DocumentVersion } from "@/lib/api";
import { usePermissions } from "@/features/auth/hooks";

interface CollaboratorInfo {
  userId: string;
  userName: string;
  color: string;
}

interface DocumentHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onTitleBlur: () => void;
  onSaveVersion: () => void;
  isSaving: boolean;
  isOnline: boolean;
  versions: DocumentVersion[];
  isLoading: boolean;
  error: string | null;
  onViewDiff: (version: DocumentVersion, previousVersion?: DocumentVersion) => void;
  onRestore: (versionNumber: number) => void;
  onToggleExpanded: (expanded: boolean) => void;
  isExpanded: boolean;
  collaborators?: CollaboratorInfo[];
  isCollabConnected?: boolean;
}

export function DocumentHeader({
  title,
  onTitleChange,
  onTitleBlur,
  onSaveVersion,
  isSaving,
  isOnline,
  versions,
  isLoading,
  error,
  onViewDiff,
  onRestore,
  onToggleExpanded,
  isExpanded,
  collaborators = [],
  isCollabConnected = false,
}: DocumentHeaderProps) {
  const [showCollaborators, setShowCollaborators] = useState(false);
  const collaboratorsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (collaboratorsRef.current && !collaboratorsRef.current.contains(event.target as Node)) {
        setShowCollaborators(false);
      }
    };

    if (showCollaborators) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCollaborators]);

  const { can } = usePermissions();
  const canEdit = can('edit');
  const canRollback = can('rollback_versions');

  return (
    <div className="px-8 pt-8 pb-4 flex items-start justify-between gap-4">
      {/* Left: Document Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onBlur={onTitleBlur}
        placeholder="Untitled Document"
        disabled={!canEdit}
        className="flex-1 text-4xl font-bold bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 leading-tight py-1 disabled:opacity-70 disabled:cursor-not-allowed"
      />

      {/* Right: Version Controls and Collaborators */}
      <div className="flex items-center gap-2 pt-2">
        {/* Collaborators Dropdown */}
        {isCollabConnected && collaborators.length > 0 && (
          <div className="relative" ref={collaboratorsRef}>
            <Button
              onClick={() => setShowCollaborators(!showCollaborators)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">{collaborators.length}</span>
              {showCollaborators ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            
            {/* Collaborators List Dropdown */}
            {showCollaborators && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Active Collaborators ({collaborators.length})
                  </h3>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.userId}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-3"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: collaborator.color }}
                        title={collaborator.color}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {collaborator.userName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Currently editing
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                          Online
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {canEdit && (
          <Button
            onClick={onSaveVersion}
            disabled={isSaving || !isOnline}
            size="sm"
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white"
            title="Save current version"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Version'}
          </Button>
        )}
        
        <div className="relative">
          <Button
            onClick={() => onToggleExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            History
            {versions.length > 0 && (
              <span className="text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full ml-1">
                {versions.length}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          
          {/* Version History Dropdown */}
          {isExpanded && (
            <VersionHistoryDropdown
              versions={versions}
              isLoading={isLoading}
              error={error}
              onViewDiff={onViewDiff}
              onRestore={onRestore}
              canRollback={canRollback}
            />
          )}
        </div>
      </div>
    </div>
  );
}
