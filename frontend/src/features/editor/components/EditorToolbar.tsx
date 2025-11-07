// /features/editor/components/EditorToolbar.tsx
"use client";

import { Editor } from "@tiptap/react";
import { Eye } from "lucide-react";
import {
  TextFormatting,
  Headings,
  Lists,
  TextAlignment,
  LinkManagement,
  ColorPicker,
  FontOptions,
} from "./toolbarComponents";
import { usePermissions } from "@/features/auth";

interface EditorToolbarProps {
  editor: Editor | null;
}

// Main Toolbar Component
export function EditorToolbar({ editor }: EditorToolbarProps) {
  const { can } = usePermissions();
  const canEdit = can('edit');

  if (!editor) {
    return null;
  }

  if (!canEdit) {
    return (
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2 p-3 text-sm text-gray-500">
          <Eye className="h-4 w-4" />
          <span>You have view-only access to this document</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-1 p-2">
        {/* Text Formatting */}
        <TextFormatting editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Headings */}
        <Headings editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Font Options */}
        <FontOptions editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Color Picker */}
        <ColorPicker editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Lists and Quotes */}
        <Lists editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Text Alignment */}
        <TextAlignment editor={editor} />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Link Management */}
        <LinkManagement editor={editor} />
      </div>
    </div>
  );
}
