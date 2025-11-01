// features/editor/components/VersionDiff.tsx
import { useEffect, useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type DocumentVersion } from '@/lib/api';
import DiffMatchPatch from 'diff-match-patch';

interface VersionDiffProps {
  currentVersion: DocumentVersion;
  previousVersion?: DocumentVersion;
  onClose: () => void;
}

export function VersionDiff({ currentVersion, previousVersion, onClose }: VersionDiffProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  // Parse TipTap JSON to plain text for diffing
  const parseContent = (jsonContent: string): string => {
    try {
      const parsed = JSON.parse(jsonContent);
      
      const extractText = (node: any): string => {
        if (!node) return '';
        
        if (node.type === 'text') {
          return node.text || '';
        }
        
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join('');
        }
        
        return '';
      };
      
      return extractText(parsed);
    } catch (error) {
      console.error('Failed to parse content:', error);
      return jsonContent;
    }
  };

  const diffs = useMemo(() => {
    const dmp = new DiffMatchPatch();
    
    const oldText = previousVersion ? parseContent(previousVersion.content) : '';
    const newText = parseContent(currentVersion.content);
    
    const diffs = dmp.diff_main(oldText, newText);
    dmp.diff_cleanupSemantic(diffs);
    
    return diffs;
  }, [currentVersion, previousVersion]);

  useEffect(() => {
    // Convert diffs to HTML
    const html = diffs.map(([operation, text]: [number, string]) => {
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');
      
      if (operation === 1) {
        // Addition
        return `<span class="bg-green-100 text-green-800">${escapedText}</span>`;
      } else if (operation === -1) {
        // Deletion
        return `<span class="bg-red-100 text-red-800 line-through">${escapedText}</span>`;
      } else {
        // No change
        return `<span>${escapedText}</span>`;
      }
    }).join('');
    
    setRenderedHtml(html);
  }, [diffs]);

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

  const getChangeStats = () => {
    let additions = 0;
    let deletions = 0;
    
    diffs.forEach(([operation, text]: [number, string]) => {
      if (operation === 1) additions += text.length;
      if (operation === -1) deletions += text.length;
    });
    
    return { additions, deletions };
  };

  const { additions, deletions } = getChangeStats();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Version Comparison
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <div>
                <span className="font-medium">Version {currentVersion.versionNumber}</span>
                <span className="text-slate-400 mx-2">•</span>
                <span>{formatDate(currentVersion.timestamp)}</span>
              </div>
              {previousVersion && (
                <>
                  <span className="text-slate-400">vs</span>
                  <div>
                    <span className="font-medium">Version {previousVersion.versionNumber}</span>
                    <span className="text-slate-400 mx-2">•</span>
                    <span>{formatDate(previousVersion.timestamp)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">+{additions}</span>
            <span className="text-slate-500">additions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-medium">-{deletions}</span>
            <span className="text-slate-500">deletions</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-green-100 border border-green-200 rounded"></span>
            <span>Added</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-red-100 border border-red-200 rounded"></span>
            <span>Removed</span>
          </div>
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-auto p-6">
          <div 
            className="prose max-w-none font-mono text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
