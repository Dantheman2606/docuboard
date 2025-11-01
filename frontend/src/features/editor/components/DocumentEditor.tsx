// /features/editor/components/DocumentEditor.tsx
"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { EditorToolbar } from "./EditorToolbar";
import { VersionDiff } from "./VersionDiff";
import { useDocumentStore } from "@/stores/documentStore";
import { api, type DocumentVersion } from "@/lib/api";
import { WifiOff, Wifi, Save, Clock, ChevronUp, ChevronDown, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentEditorProps {
  documentId: string;
  projectId: string;
}

export function DocumentEditor({ documentId, projectId }: DocumentEditorProps) {
  const { documents, updateDocumentContent, updateDocumentTitle, isOnline, setDocument } =
    useDocumentStore();
  const [title, setTitle] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffVersion, setDiffVersion] = useState<DocumentVersion | null>(null);
  const [diffPrevVersion, setDiffPrevVersion] = useState<DocumentVersion | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const document = documents[documentId];

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: "Start typing your document...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
    onUpdate: ({ editor }) => {
      // Save content as JSON for better version control
      const json = JSON.stringify(editor.getJSON());
      updateDocumentContent(documentId, json);
    },
    onSelectionUpdate: () => {
      // Force toolbar to re-render when selection changes
      setEditorKey((prev) => prev + 1);
    },
  });

  // Update editor content when document changes
  useEffect(() => {
    if (editor && document?.content) {
      try {
        // Try to parse as JSON first (TipTap JSON format)
        const parsed = JSON.parse(document.content);
        if (parsed.type === 'doc') {
          // It's TipTap JSON, use setContent with JSON
          editor.commands.setContent(parsed);
        } else {
          // Not valid TipTap JSON, treat as HTML
          editor.commands.setContent(document.content);
        }
      } catch {
        // If parsing fails, it's HTML or plain text
        if (editor.getHTML() !== document.content) {
          editor.commands.setContent(document.content);
        }
      }
    }
  }, [document?.content, editor]);

  // Set initial title
  useEffect(() => {
    if (document?.title) {
      setTitle(document.title);
    }
  }, [document?.title]);

  // Fetch versions when document changes or when expanded
  useEffect(() => {
    if (isExpanded && documentId) {
      const fetchVersions = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedVersions = await api.getVersions(documentId);
          setVersions(fetchedVersions);
        } catch (err) {
          setError("Failed to load version history");
          console.error("Error fetching versions:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVersions();
    }
  }, [documentId, isExpanded]);

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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== document?.title) {
      updateDocumentTitle(documentId, title);
    }
  };

  const handleSaveVersion = async () => {
    if (!editor || !document) return;
    
    setIsSaving(true);
    try {
      const user = localStorage.getItem('user');
      const userName = user ? JSON.parse(user).name : 'Unknown';
      
      // Get editor content as JSON
      const content = JSON.stringify(editor.getJSON());
      
      const version = await api.createVersion(documentId, {
        content,
        author: userName,
        description: `Saved at ${new Date().toLocaleString()}`,
      });
      
      console.log('✅ Version saved:', version);
      
      // Refresh the document to include new version
      const updatedDoc = await api.getDocument(documentId);
      setDocument(updatedDoc);
      
      // Refresh versions list if expanded
      if (isExpanded) {
        const fetchedVersions = await api.getVersions(documentId);
        setVersions(fetchedVersions);
      }
    } catch (error) {
      console.error('Failed to save version:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDiff = (version: DocumentVersion, previousVersion?: DocumentVersion) => {
    setDiffVersion(version);
    setDiffPrevVersion(previousVersion);
    setShowDiff(true);
  };

  const handleRestore = async (versionNumber: number) => {
    if (!editor) return;
    
    try {
      const restoredDoc = await api.restoreVersion(documentId, versionNumber);
      
      // Update local state
      setDocument(restoredDoc);
      
      // Update editor content - parse JSON if needed
      try {
        const parsed = JSON.parse(restoredDoc.content);
        if (parsed.type === 'doc') {
          editor.commands.setContent(parsed);
        } else {
          editor.commands.setContent(restoredDoc.content);
        }
      } catch {
        editor.commands.setContent(restoredDoc.content);
      }
      
      console.log('✅ Restored to version', versionNumber);
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Document not found.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2 text-sm flex items-center gap-2 justify-center">
          <WifiOff size={16} />
          <span>You're offline. Changes will be saved locally and synced when you're back online.</span>
        </div>
      )}
      
      {/* Online indicator for pending sync */}
      {isOnline && document?.pendingSync && (
        <div className="bg-blue-500 text-white px-4 py-2 text-sm flex items-center gap-2 justify-center">
          <Wifi size={16} />
          <span>Syncing changes to server...</span>
        </div>
      )}

      {/* Title Input */}
      <div className="px-8 pt-8 pb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Untitled Document"
          className="w-full text-4xl font-bold bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
        />
      </div>

      {/* Toolbar with Version Controls */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <EditorToolbar key={editorKey} editor={editor} />
          
          {/* Version Controls in Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2">
            <Button
              onClick={handleSaveVersion}
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
                onClick={() => setIsExpanded(!isExpanded)}
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
                              onClick={() => handleViewDiff(version, versions[index + 1])}
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
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Version Diff Modal */}
      {showDiff && diffVersion && (
        <VersionDiff
          currentVersion={diffVersion}
          previousVersion={diffPrevVersion}
          onClose={() => setShowDiff(false)}
        />
      )}
    </div>
  );
}
