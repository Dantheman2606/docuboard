// /features/editor/components/DocumentEditor/VersionHistoryDropdown.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Eye, RotateCcw } from "lucide-react";
import type { DocumentVersion } from "@/lib/api";

interface VersionHistoryDropdownProps {
  versions: DocumentVersion[];
  isLoading: boolean;
  error: string | null;
  onViewDiff: (version: DocumentVersion, previousVersion?: DocumentVersion) => void;
  onRestore: (versionNumber: number) => void;
}

export function VersionHistoryDropdown({
  versions,
  isLoading,
  error,
  onViewDiff,
  onRestore,
}: VersionHistoryDropdownProps) {
  // Helper function to format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center text-slate-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-sm">Loading versions...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-600 text-sm">
          {error}
        </div>
      ) : versions.length === 0 ? (
        <div className="p-4 text-center text-slate-500 text-sm">
          No version history yet
        </div>
      ) : (
        <div>
          {versions.map((version, index) => (
            <div
              key={version.versionNumber}
              className="p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800 text-sm">
                      Version {version.versionNumber}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{version.description}</p>
                  <p className="text-xs text-slate-500">
                    by {version.author} • {formatRelativeTime(version.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDiff(version, versions[index + 1])}
                  className="flex-1 text-xs h-7"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                {index !== 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(version.versionNumber)}
                    className="flex-1 text-xs h-7"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
