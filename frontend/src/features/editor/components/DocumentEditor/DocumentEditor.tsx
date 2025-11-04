// /features/editor/components/DocumentEditor/DocumentEditor.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useQueryClient } from "@tanstack/react-query";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { EditorToolbar } from "../EditorToolbar";
import { VersionDiff } from "../VersionDiff";
import { EditorStatusBar } from "./EditorStatusBar";
import { DocumentHeader } from "./DocumentHeader";
import { useDocumentStore } from "@/stores/documentStore";
import { api, type DocumentVersion } from "@/lib/api";

interface CollaboratorInfo {
  userId: string;
  userName: string;
  color: string;
}

interface DocumentEditorProps {
  documentId: string;
  projectId: string;
}

export function DocumentEditor({ documentId, projectId }: DocumentEditorProps) {
  const { documents, updateDocumentContent, updateDocumentTitle, isOnline, setDocument } =
    useDocumentStore();
  const queryClient = useQueryClient();
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
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [isCollabConnected, setIsCollabConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const isRemoteUpdate = useRef(false);
  const isLocalUpdate = useRef(false);
  const document = documents[documentId];

  const editor = useEditor({
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
      // Skip if this is a remote update
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }

      // Mark as local update to prevent feedback loop
      isLocalUpdate.current = true;

      // Save content as JSON for better version control
      const json = JSON.stringify(editor.getJSON());
      updateDocumentContent(documentId, json);

      // Broadcast to other users via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'content-update',
          content: json,
          documentId,
        }));
      }
    },
    onSelectionUpdate: () => {
      // Force toolbar to re-render when selection changes
      setEditorKey((prev) => prev + 1);
    },
  });

  // Setup WebSocket for real-time collaboration
  useEffect(() => {
    if (!documentId || !editor) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : null;
    const userId = userData?._id || userData?.id || Math.random().toString(36).substring(7);
    const userName = userData?.name || 'Anonymous';

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
    const ws = new WebSocket(`${wsUrl}/collab`);

    ws.onopen = () => {
      console.log('🔄 Connected to collaboration server');
      setIsCollabConnected(true);
      
      // Send join message
      ws.send(JSON.stringify({
        type: 'join',
        documentId,
        userId,
        userName,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'content-update' && editor) {
          // Only update if it's from another user
          if (data.userId !== userId) {
            isRemoteUpdate.current = true;
            const parsed = JSON.parse(data.content);
            editor.commands.setContent(parsed);
          }
        } else if (data.type === 'users') {
          // Update collaborators list (filter out current user)
          setCollaborators(data.users.filter((u: CollaboratorInfo) => u.userId !== userId));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('👋 Disconnected from collaboration server');
      setIsCollabConnected(false);
      setCollaborators([]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsCollabConnected(false);
    };

    wsRef.current = ws;

    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [documentId, editor]);

  // Update editor content when document changes
  useEffect(() => {
    // Skip if this update was triggered by local typing
    if (isLocalUpdate.current) {
      isLocalUpdate.current = false;
      return;
    }

    if (editor && document?.content) {
      try {
        // Try to parse as JSON first (TipTap JSON format)
        const parsed = JSON.parse(document.content);
        if (parsed.type === 'doc') {
          // It's TipTap JSON, use setContent with JSON
          isRemoteUpdate.current = true;
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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleTitleBlur = async () => {
    if (title.trim() && title !== document?.title) {
      // Update the document store (for local state and offline support)
      updateDocumentTitle(documentId, title);
      
      // If online, also update the backend and refresh the cache
      if (isOnline) {
        try {
          await api.updateDocument(documentId, { title });
          // Invalidate the documents query to refresh the sidebar
          await queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
        } catch (error) {
          console.error('Failed to update document title:', error);
        }
      }
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
      {/* Status Bar */}
      <EditorStatusBar 
        isOnline={isOnline} 
        pendingSync={document?.pendingSync}
        isCollaborationConnected={isCollabConnected}
        collaborators={collaborators}
      />

      {/* Document Header with Title and Version Controls */}
      <DocumentHeader
        title={title}
        onTitleChange={handleTitleChange}
        onTitleBlur={handleTitleBlur}
        onSaveVersion={handleSaveVersion}
        isSaving={isSaving}
        isOnline={isOnline}
        versions={versions}
        isLoading={isLoading}
        error={error}
        onViewDiff={handleViewDiff}
        onRestore={handleRestore}
        onToggleExpanded={setIsExpanded}
        isExpanded={isExpanded}
        collaborators={collaborators}
        isCollabConnected={isCollabConnected}
      />

      {/* Editor Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50">
        <EditorToolbar key={editorKey} editor={editor} />
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
