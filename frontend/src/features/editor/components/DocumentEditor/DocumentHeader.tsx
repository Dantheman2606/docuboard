// /features/editor/components/DocumentEditor/DocumentHeader.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { VersionHistoryDropdown } from "./VersionHistoryDropdown";
import type { DocumentVersion } from "@/lib/api";

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
}: DocumentHeaderProps) {
  return (
    <div className="px-8 pt-8 pb-4 flex items-start justify-between gap-4">
      {/* Left: Document Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onBlur={onTitleBlur}
        placeholder="Untitled Document"
        className="flex-1 text-4xl font-bold bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 leading-tight py-1"
      />

      {/* Right: Version Controls */}
      <div className="flex items-center gap-2 pt-2">
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
            />
          )}
        </div>
      </div>
    </div>
  );
}
