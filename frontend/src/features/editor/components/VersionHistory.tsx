// features/editor/components/VersionHistory.tsx
import { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, RotateCcw, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, type DocumentVersion } from '@/lib/api';

interface VersionHistoryProps {
  documentId: string;
  onViewDiff: (version: DocumentVersion, previousVersion?: DocumentVersion) => void;
  onRestore: (versionNumber: number) => void;
  onSaveVersion: () => void;
  isSaving: boolean;
  isOnline: boolean;
}

export function VersionHistory({ documentId, onViewDiff, onRestore, onSaveVersion, isSaving, isOnline }: VersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isExpanded && documentId) {
      loadVersions();
    }
  }, [isExpanded, documentId]);

  const loadVersions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getVersions(documentId);
      setVersions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load versions');
      console.error('Failed to load versions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDiff = (version: DocumentVersion, index: number) => {
    const previousVersion = versions[index + 1]; // Next item in descending list
    onViewDiff(version, previousVersion);
  };

  const handleRestore = async (versionNumber: number) => {
    if (confirm(`Are you sure you want to restore to version ${versionNumber}? Your current changes will be saved as a new version.`)) {
      onRestore(versionNumber);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(timestamp);
  };

  return (
    <div className="fixed top-16 right-4 w-80 z-40">
      {/* Save Version Button */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg mb-2 p-3">
        <Button
          onClick={onSaveVersion}
          disabled={isSaving || !isOnline}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white"
          title="Save current version"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Version...' : 'Save Current Version'}
        </Button>
      </div>

      {/* Version History Panel */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-t-lg"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-800">Version History</span>
            {versions.length > 0 && (
              <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                {versions.length}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Version List */}
        {isExpanded && (
          <div className="border-t border-slate-200">
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
              <div className="max-h-96 overflow-y-auto">
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
                        onClick={() => handleViewDiff(version, index)}
                        className="flex-1 text-xs h-7"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {index !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(version.versionNumber)}
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
        )}
      </div>
    </div>
  );
}
