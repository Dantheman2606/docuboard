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
import { EditorToolbar } from "./EditorToolbar";
import { useDocumentStore } from "@/stores/documentStore";

interface DocumentEditorProps {
  documentId: string;
  projectId: string;
}

export function DocumentEditor({ documentId, projectId }: DocumentEditorProps) {
  const { documents, updateDocumentContent, updateDocumentTitle } =
    useDocumentStore();
  const [title, setTitle] = useState("");
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
        multicolor: false,
      }),
    ],
    content: document?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateDocumentContent(documentId, html);
    },
  });

  // Update editor content when document changes
  useEffect(() => {
    if (editor && document?.content && editor.getHTML() !== document.content) {
      editor.commands.setContent(document.content);
    }
  }, [document?.content, editor]);

  // Set initial title
  useEffect(() => {
    if (document?.title) {
      setTitle(document.title);
    }
  }, [document?.title]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== document?.title) {
      updateDocumentTitle(documentId, title);
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

      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
